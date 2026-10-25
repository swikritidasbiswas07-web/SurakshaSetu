# SurakshaSetu MVP

A privacy-conscious, multilingual job-offer review and employment-conditions comparison prototype.

## Stack
- Frontend: React + Vite
- Backend: FastAPI + SQLite
- Authentication: password hashing with PBKDF2 and signed bearer tokens
- OCR: optional Tesseract integration (manual review is always available)
- Offline: app-shell cache and static safety guidance

## Important limitations
This is a hackathon MVP, not a production-ready safeguarding or emergency-response service. The rules flag missing or concerning information; they do not determine that a recruiter is criminal or that a job is safe. Verify all helpline numbers and referral information before public deployment. The OCR feature requires Tesseract installed on the computer to process images; PDF OCR is not enabled in this starter build. Sensitive personal data should not be entered into the demo.

## Requirements
- Node.js 20+ recommended
- Python 3.11+
- Optional: Tesseract OCR installed and available on PATH

## Run the backend
From the project root:

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

If PowerShell blocks activation, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Backend docs: http://127.0.0.1:8000/docs

## Run the frontend
Open a second terminal at the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints, usually http://localhost:5173.

## Configuration
The frontend uses `VITE_API_BASE_URL`, defaulting to `http://127.0.0.1:8000`. For a deployed frontend, set it to your deployed API URL.

## Before any real deployment
1. Replace the demo support directory with contacts verified from official sources and record the verification date.
2. Add HTTPS, rate limiting, secure cookie/session strategy, CSRF protections where applicable, account recovery, email verification and security review.
3. Review the Privacy Policy and Terms with a qualified legal adviser. Ensure policy claims match actual data practices.
4. Add retention/deletion controls, database backups and a threat model.
5. Do not store identity documents or precise location unless necessary and appropriately protected.
6. Test Bengali/Hindi translations with fluent speakers.
