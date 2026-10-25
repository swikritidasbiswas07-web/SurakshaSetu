from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from passlib.hash import pbkdf2_sha256
from typing import Optional
from pathlib import Path
import sqlite3, secrets, hashlib, time, os, io

DB_PATH = Path(__file__).resolve().parent / "surakshasetu.db"
TOKEN_TTL = 60 * 60 * 24 * 7

app = FastAPI(title="SurakshaSetu API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at INTEGER NOT NULL
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS tokens (
            token_hash TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            kind TEXT NOT NULL,
            payload TEXT NOT NULL,
            result TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )""")
init_db()

class RegisterInput(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=10, max_length=128)

class LoginInput(BaseModel):
    email: str
    password: str

class OfferInput(BaseModel):
    recruiter_name: str = ""
    job_title: str = ""
    salary: Optional[float] = Field(default=None, ge=0, le=100000000)
    pay_period: str = "month"
    work_hours_per_day: Optional[float] = Field(default=None, ge=0, le=24)
    deductions_explained: Optional[bool] = None
    location: str = ""
    accommodation_promised: Optional[bool] = None
    upfront_fee_requested: Optional[bool] = None
    written_contract: Optional[bool] = None
    original_text: str = ""

class CompareInput(BaseModel):
    promised_salary: Optional[float] = Field(default=None, ge=0, le=100000000)
    actual_salary: Optional[float] = Field(default=None, ge=0, le=100000000)
    promised_hours: Optional[float] = Field(default=None, ge=0, le=24)
    actual_hours: Optional[float] = Field(default=None, ge=0, le=24)
    promised_location: str = ""
    actual_location: str = ""
    promised_deductions: str = ""
    actual_deductions: str = ""
    promised_accommodation: str = ""
    actual_accommodation: str = ""

def analyse_offer(data: dict):
    flags = []
    missing = []
    if not data.get("job_title"): missing.append("Job role is not specified.")
    if data.get("salary") is None: missing.append("Salary amount is not specified.")
    if not data.get("location"): missing.append("Work location is not specified.")
    if data.get("written_contract") is False:
        flags.append(("high", "No written contract", "Ask for written terms before travelling or resigning from other work."))
    if data.get("upfront_fee_requested") is True:
        flags.append(("high", "Upfront recruitment fee requested", "Do not pay until you have independently checked the recruiter and the legality of the charge. Seek trusted advice."))
    if data.get("deductions_explained") is False:
        flags.append(("medium", "Deductions are unclear", "Request a written breakdown of every deduction and the take-home pay."))
    if data.get("work_hours_per_day") is not None and data["work_hours_per_day"] > 12:
        flags.append(("medium", "Very long daily hours reported", "Confirm the schedule, breaks, overtime and applicable labour protections with a trusted source."))
    if data.get("accommodation_promised") is False:
        flags.append(("info", "Accommodation not confirmed", "If housing is important to the decision, confirm where you will stay and who pays."))
    if not flags:
        flags.append(("info", "No rule-based warning triggered", "This does not mean the offer is safe. Independently verify the recruiter, workplace and written terms."))
    return {"flags": [{"level": a, "title": b, "advice": c} for a,b,c in flags], "missing_information": missing,
            "notice": "This is an informational checklist, not a fraud determination or a guarantee of safety."}

def compare_conditions(data: dict):
    discrepancies = []
    ps, actual = data.get("promised_salary"), data.get("actual_salary")
    if ps is not None and actual is not None and actual < ps:
        discrepancies.append({"field":"Salary", "level":"high", "detail":f"Actual salary is {ps-actual:g} lower than the promised amount."})
    ph, ah = data.get("promised_hours"), data.get("actual_hours")
    if ph is not None and ah is not None and ah > ph:
        discrepancies.append({"field":"Working hours", "level":"medium", "detail":f"Actual daily hours are {ah-ph:g} higher than promised."})
    for key, label in [("location","Work location"),("deductions","Deductions"),("accommodation","Accommodation")]:
        p, a = data.get("promised_"+key,"").strip(), data.get("actual_"+key,"").strip()
        if p and a and p.casefold() != a.casefold():
            discrepancies.append({"field":label, "level":"medium", "detail":f"The recorded actual condition differs from the promise for {label.lower()}."})
    return {"discrepancies":discrepancies, "notice":"Record only what you feel safe sharing. Keep copies of relevant documents where safe to do so."}


class ResearchInput(OfferInput):
    pass

def build_research_report(data: dict):
    # Transparent, rule-based report using a curated set of official reference portals.
    # This is not a live web search and does not verify a recruiter or a specific legal claim.
    categories = {
        "Contract and terms": {"score": 0, "why": [], "source_ids": ["labour", "indiacode"]},
        "Recruitment fee": {"score": 0, "why": [], "source_ids": ["labour", "consumer"]},
        "Wages and deductions": {"score": 0, "why": [], "source_ids": ["labour"]},
        "Hours and conditions": {"score": 0, "why": [], "source_ids": ["labour"]},
        "Accommodation": {"score": 0, "why": [], "source_ids": ["women", "emergency"]},
        "Missing information": {"score": 0, "why": [], "source_ids": ["labour"]},
    }
    if data.get("written_contract") is False:
        c=categories["Contract and terms"]; c["score"] = 85; c["why"].append("Written contract marked as not provided.")
    elif data.get("written_contract") is None:
        c=categories["Contract and terms"]; c["score"] = 35; c["why"].append("Contract status is unknown.")
    if data.get("upfront_fee_requested") is True:
        c=categories["Recruitment fee"]; c["score"] = 90; c["why"].append("An upfront recruitment fee was reported. Verify the basis and legitimacy before paying.")
    elif data.get("upfront_fee_requested") is None:
        c=categories["Recruitment fee"]; c["score"] = 25; c["why"].append("No answer was provided about an upfront fee; this is unknown, not proof of a fee.")
    if data.get("deductions_explained") is False:
        c=categories["Wages and deductions"]; c["score"] = 65; c["why"].append("Deductions are marked as not explained in writing.")
    elif data.get("deductions_explained") is None:
        c=categories["Wages and deductions"]; c["score"] = 25; c["why"].append("Written deduction details are unknown.")
    hours=data.get("work_hours_per_day")
    if hours is not None and hours > 12:
        c=categories["Hours and conditions"]; c["score"] = 75; c["why"].append(f"Reported daily hours are {hours:g}; verify breaks, overtime and applicable rules.")
    elif hours is None:
        c=categories["Hours and conditions"]; c["score"] = 25; c["why"].append("Daily hours were not provided.")
    if data.get("accommodation_promised") is False:
        c=categories["Accommodation"]; c["score"] = 45; c["why"].append("Accommodation is not confirmed.")
    elif data.get("accommodation_promised") is None:
        c=categories["Accommodation"]; c["score"] = 20; c["why"].append("Accommodation status is unknown.")
    missing=[]
    if not data.get("job_title"): missing.append("job title")
    if data.get("salary") is None: missing.append("salary amount")
    if not data.get("location"): missing.append("work location")
    if missing:
        c=categories["Missing information"]; c["score"] = min(90, 25*len(missing)); c["why"].append("Missing: " + ", ".join(missing) + ".")
    else:
        categories["Missing information"]["score"] = 0
        categories["Missing information"]["why"].append("Core job details were supplied; other terms may still need verification.")
    sources={
      "labour":{"title":"Ministry of Labour & Employment, Government of India","url":"https://labour.gov.in/","authority":"Government of India","relevance":"Official labour ministry portal for current labour-law and worker-protection information."},
      "indiacode":{"title":"India Code","url":"https://www.indiacode.nic.in/","authority":"Legislative Department, Government of India","relevance":"Official repository to look up the text of central legislation. Check applicability and current amendments."},
      "consumer":{"title":"Department of Consumer Affairs","url":"https://consumeraffairs.nic.in/","authority":"Government of India","relevance":"Official consumer-affairs information; relevance depends on the circumstances of the fee request."},
      "women":{"title":"Ministry of Women and Child Development","url":"https://wcd.gov.in/","authority":"Government of India","relevance":"Official ministry information and schemes related to women and children."},
      "emergency":{"title":"Emergency Response Support System (India)","url":"https://112.gov.in/","authority":"Government of India","relevance":"Official emergency-response portal. Use local emergency help if there is immediate danger."}
    }
    used=[]
    for c in categories.values():
      for sid in c["source_ids"]:
        if sid not in used: used.append(sid)
    overall=max((c["score"] for c in categories.values()), default=0)
    return {"title":"Research-backed offer review", "mode":"curated_official_sources", "mode_notice":"This version matches reported concerns to a curated list of official reference portals. It does not perform live web search, verify a recruiter, or make a legal determination. Open sources to check current guidance.", "categories":[{"name":name,"score":c["score"],"findings":c["why"],"source_ids":c["source_ids"]} for name,c in categories.items()], "sources":[sources[sid] for sid in used], "overall_attention":overall, "interpretation":"Scores indicate which categories need follow-up based on entered answers; they are not a probability of trafficking, fraud, or harm. Unknown answers are not treated as proof of danger.", "next_steps":["Ask for all job terms, deductions and accommodation details in writing.","Verify the employer and recruiter independently using official channels.","Do not pay a fee or travel under pressure; seek trusted advice if unsure.","If there is immediate danger, move to a safer place if possible and contact local emergency services."]}


def token_hash(token: str):
    return hashlib.sha256(token.encode()).hexdigest()

def current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Please log in to continue.")
    token = authorization[7:].strip()
    with connect() as db:
        row = db.execute("SELECT users.id, users.email FROM tokens JOIN users ON users.id=tokens.user_id WHERE token_hash=? AND expires_at>?",
                         (token_hash(token), int(time.time()))).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    return {"id": row["id"], "email": row["email"]}

@app.get("/")
def root():
    return {"name":"SurakshaSetu API","status":"running","version":"0.1.0"}

@app.get("/api/health")
def health():
    return {"status":"ok"}

@app.post("/api/auth/register")
def register(data: RegisterInput):
    email = data.email.strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    with connect() as db:
        try:
            cur = db.execute("INSERT INTO users(email,password_hash,created_at) VALUES(?,?,?)",
                             (email, pbkdf2_sha256.hash(data.password), int(time.time())))
            user_id = cur.lastrowid
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
    token = secrets.token_urlsafe(32)
    with connect() as db:
        db.execute("INSERT INTO tokens(token_hash,user_id,expires_at) VALUES(?,?,?)",
                   (token_hash(token), user_id, int(time.time())+TOKEN_TTL))
    return {"token":token,"user":{"id":user_id,"email":email}}

@app.post("/api/auth/login")
def login(data: LoginInput):
    email = data.email.strip().lower()
    with connect() as db:
        row = db.execute("SELECT id,email,password_hash FROM users WHERE email=?", (email,)).fetchone()
    if not row or not pbkdf2_sha256.verify(data.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    token = secrets.token_urlsafe(32)
    with connect() as db:
        db.execute("INSERT INTO tokens(token_hash,user_id,expires_at) VALUES(?,?,?)",
                   (token_hash(token), row["id"], int(time.time())+TOKEN_TTL))
    return {"token":token,"user":{"id":row["id"],"email":row["email"]}}

@app.get("/api/me")
def me(user=Depends(current_user)):
    return {"user":user}

@app.post("/api/offer/analyse")
def offer_analyse(data: OfferInput, user=Depends(current_user)):
    result = analyse_offer(data.model_dump())
    import json
    with connect() as db:
        db.execute("INSERT INTO assessments(user_id,kind,payload,result,created_at) VALUES(?,?,?,?,?)",
                   (user["id"],"offer",json.dumps(data.model_dump()),json.dumps(result),int(time.time())))
    return result

@app.post("/api/conditions/compare")
def conditions_compare(data: CompareInput, user=Depends(current_user)):
    result = compare_conditions(data.model_dump())
    import json
    with connect() as db:
        db.execute("INSERT INTO assessments(user_id,kind,payload,result,created_at) VALUES(?,?,?,?,?)",
                   (user["id"],"compare",json.dumps(data.model_dump()),json.dumps(result),int(time.time())))
    return result


@app.post("/api/research/report")
def research_report(data: ResearchInput, user=Depends(current_user)):
    result = build_research_report(data.model_dump())
    import json
    with connect() as db:
        db.execute("INSERT INTO assessments(user_id,kind,payload,result,created_at) VALUES(?,?,?,?,?)",
                   (user["id"], "research", json.dumps(data.model_dump()), json.dumps(result), int(time.time())))
    return result

@app.get("/api/assessments")
def assessments(user=Depends(current_user)):
    import json
    with connect() as db:
        rows = db.execute("SELECT id,kind,payload,result,created_at FROM assessments WHERE user_id=? ORDER BY id DESC LIMIT 50",
                          (user["id"],)).fetchall()
    return [{"id":r["id"],"kind":r["kind"],"payload":json.loads(r["payload"]),
             "result":json.loads(r["result"]),"created_at":r["created_at"]} for r in rows]

@app.delete("/api/assessments/{assessment_id}")
def delete_assessment(assessment_id: int, user=Depends(current_user)):
    with connect() as db:
        cur = db.execute("DELETE FROM assessments WHERE id=? AND user_id=?", (assessment_id,user["id"]))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Assessment not found.")
    return {"deleted":True}

@app.post("/api/ocr")
async def ocr_image(file: UploadFile = File(...), user=Depends(current_user)):
    if file.content_type not in {"image/png","image/jpeg","image/webp","image/tiff","image/bmp"}:
        raise HTTPException(status_code=415, detail="Upload a PNG, JPG, WEBP, TIFF or BMP image. PDF is not supported in this prototype.")
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be smaller than 8 MB.")
    try:
        from PIL import Image
        import pytesseract
        img = Image.open(io.BytesIO(content))
        extracted = pytesseract.image_to_string(img)
        if not extracted.strip():
            extracted = ""
        return {"text":extracted,"message":"Review and correct extracted text. OCR can make mistakes."}
    except ImportError:
        raise HTTPException(status_code=503, detail="OCR packages are not installed. Enter the offer details manually.")
    except Exception:
        raise HTTPException(status_code=503, detail="OCR is unavailable. Check that Tesseract is installed, or enter details manually.")

@app.get("/api/support")
def support():
    # Do not publish unverified phone numbers. This directory intentionally uses official portals only.
    return {
      "notice":"Verify contact details and availability on official websites before relying on them. If you are in immediate danger, move to a safer public place if possible and contact local emergency services.",
      "resources":[
        {"name":"Emergency Response Support System (India)", "detail":"Official national emergency portal and current contact guidance.", "url":"https://112.gov.in/"},
        {"name":"Women and Child Development, Government of India", "detail":"Official ministry information and schemes.", "url":"https://wcd.gov.in/"},
        {"name":"National Commission for Women", "detail":"Official information on complaints and support.", "url":"https://www.ncw.gov.in/"},
        {"name":"West Bengal Police", "detail":"Official state police portal; check current district contacts.", "url":"https://wbpolice.gov.in/"}
      ]
    }
