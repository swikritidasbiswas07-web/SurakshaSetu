import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const copy = {
  en: {
    navHome:"Home", navOffer:"Check a job offer", navCompare:"Compare conditions", navSupport:"Find support",
    navLegal:"Legal information", title:"A clearer picture before you take a job.",
    intro:"Review the details you have, notice what is missing, and keep a record of changes to working conditions. You decide what to share.",
    check:"Review a job offer", compare:"Compare conditions", support:"Find support", language:"Language",
    note:"SurakshaSetu provides an informational checklist. It cannot verify a recruiter or guarantee that a job is safe.",
    login:"Sign in", register:"Create account", email:"Email address", password:"Password (at least 10 characters)",
    logout:"Sign out", welcome:"Your workspace", saveLogin:"Continue", jobTitle:"Job title", recruiter:"Recruiter or agency name",
    salary:"Promised salary amount", period:"Pay period", hours:"Working hours per day", location:"Work location",
    deductions:"Are deductions explained in writing?", contract:"Is there a written contract?", fee:"Is an upfront fee requested?",
    accommodation:"Is accommodation confirmed?", yes:"Yes", no:"No", unknown:"Not sure / not provided",
    analyse:"Review details", result:"Review results", missing:"Information to clarify", flags:"Items to review",
    promisedSalary:"Promised salary", actualSalary:"Actual salary received", promisedHours:"Promised hours/day", actualHours:"Actual hours/day",
    promisedLocation:"Promised location", actualLocation:"Actual location", promisedDeductions:"Promised deductions", actualDeductions:"Actual deductions",
    promisedAccommodation:"Promised accommodation", actualAccommodation:"Actual accommodation", compareBtn:"Compare conditions",
    discrepancies:"Differences found", noDiff:"No differences detected in the fields entered. Check all terms carefully.",
    upload:"Upload an offer image for text extraction", extract:"Extract text", extracted:"Extracted text (review and correct it)",
    supportTitle:"Support and official resources", supportNote:"Check the official source for current contact details and service availability.",
    terms:"Terms & Conditions", privacy:"Privacy Policy", about:"About SurakshaSetu", saved:"Saved assessments",
    offline:"You may be offline. Saved guidance and the app shell may still be available; account and analysis features require a connection.",
    error:"Something went wrong", loading:"Please wait…", delete:"Delete", empty:"No saved assessments yet.",
    termsBody:"SurakshaSetu is an informational prototype. It highlights missing information and potential discrepancies using user-entered data. It does not certify employers, determine criminality, provide legal advice, or guarantee safety. Users should independently verify offers and seek trusted help when needed. Do not use the platform to submit false information, harass people, or make public accusations. Availability and functionality may change. These draft terms must be reviewed for applicable law before public launch.",
    privacyBody:"This prototype stores account email addresses and assessment details in its SQLite database when the API is running. Passwords are stored as salted hashes; bearer tokens are stored as hashes in the database. Assessment details are saved to the signed-in account. Do not enter highly sensitive identity, banking, medical, or precise location information. This prototype does not yet provide self-service account deletion, email verification, account recovery, or a production-grade security programme. Contact the project team before entering real personal data. Update this notice to match actual deployment and retention practices.",
    safety:"If you are in immediate danger, seek a safer public place if possible and contact local emergency services. Do not confront a recruiter if doing so could increase danger."
  },
  bn: {
    navHome:"হোম", navOffer:"চাকরির প্রস্তাব যাচাই", navCompare:"শর্ত তুলনা", navSupport:"সহায়তা খুঁজুন",
    navLegal:"আইনি তথ্য", title:"চাকরি নেওয়ার আগে শর্তগুলি বুঝে নিন।",
    intro:"প্রস্তাবে কী আছে, কী তথ্য অনুপস্থিত, এবং কাজের শর্তে কী পরিবর্তন হয়েছে তা পর্যালোচনা করুন। কী তথ্য দেবেন, তা আপনার সিদ্ধান্ত।",
    check:"চাকরির প্রস্তাব পর্যালোচনা", compare:"শর্ত তুলনা", support:"সহায়তা খুঁজুন", language:"ভাষা",
    note:"সুরক্ষা সেতু তথ্যভিত্তিক চেকলিস্ট দেয়। এটি নিয়োগকর্তাকে যাচাই বা চাকরির নিরাপত্তার নিশ্চয়তা দিতে পারে না।",
    login:"লগ ইন", register:"অ্যাকাউন্ট তৈরি", email:"ইমেল ঠিকানা", password:"পাসওয়ার্ড (কমপক্ষে ১০ অক্ষর)",
    logout:"লগ আউট", welcome:"আপনার কর্মক্ষেত্র", saveLogin:"চালিয়ে যান", jobTitle:"চাকরির পদ", recruiter:"নিয়োগকারী বা সংস্থার নাম",
    salary:"প্রতিশ্রুত বেতনের পরিমাণ", period:"বেতন দেওয়ার সময়কাল", hours:"প্রতিদিন কাজের ঘণ্টা", location:"কাজের স্থান",
    deductions:"কাটছাঁট কি লিখিতভাবে ব্যাখ্যা করা হয়েছে?", contract:"লিখিত চুক্তি আছে?", fee:"আগাম টাকা চাওয়া হয়েছে?",
    accommodation:"থাকার ব্যবস্থা নিশ্চিত?", yes:"হ্যাঁ", no:"না", unknown:"জানি না / জানানো হয়নি",
    analyse:"তথ্য পর্যালোচনা", result:"পর্যালোচনার ফল", missing:"যে তথ্য পরিষ্কার করা দরকার", flags:"যে বিষয়গুলি খতিয়ে দেখুন",
    promisedSalary:"প্রতিশ্রুত বেতন", actualSalary:"প্রকৃত প্রাপ্ত বেতন", promisedHours:"প্রতিশ্রুত ঘণ্টা/দিন", actualHours:"প্রকৃত ঘণ্টা/দিন",
    promisedLocation:"প্রতিশ্রুত স্থান", actualLocation:"প্রকৃত স্থান", promisedDeductions:"প্রতিশ্রুত কাটছাঁট", actualDeductions:"প্রকৃত কাটছাঁট",
    promisedAccommodation:"প্রতিশ্রুত থাকার ব্যবস্থা", actualAccommodation:"প্রকৃত থাকার ব্যবস্থা", compareBtn:"শর্ত তুলনা করুন",
    discrepancies:"পার্থক্য পাওয়া গেছে", noDiff:"দেওয়া তথ্যের মধ্যে পার্থক্য পাওয়া যায়নি। সব শর্ত যাচাই করুন।",
    upload:"প্রস্তাবের ছবি থেকে লেখা তুলুন", extract:"লেখা তুলুন", extracted:"তোলা লেখা (পর্যালোচনা ও সংশোধন করুন)",
    supportTitle:"সহায়তা ও সরকারি তথ্য", supportNote:"বর্তমান যোগাযোগের তথ্য ও পরিষেবার জন্য সরকারি উৎস যাচাই করুন।",
    terms:"শর্তাবলি", privacy:"গোপনীয়তা নীতি", about:"সুরক্ষা সেতু সম্পর্কে", saved:"সংরক্ষিত পর্যালোচনা",
    offline:"ইন্টারনেট সংযোগ না-ও থাকতে পারে। অ্যাপের কিছু অংশ ও নির্দেশিকা চলতে পারে; অ্যাকাউন্ট ও বিশ্লেষণের জন্য সংযোগ দরকার।",
    error:"সমস্যা হয়েছে", loading:"অপেক্ষা করুন…", delete:"মুছুন", empty:"এখনও কোনও পর্যালোচনা সংরক্ষিত নেই।",
    termsBody:"সুরক্ষা সেতু একটি তথ্যভিত্তিক প্রোটোটাইপ। ব্যবহারকারীর দেওয়া তথ্য থেকে এটি অনুপস্থিত তথ্য ও সম্ভাব্য পার্থক্য দেখায়। এটি নিয়োগকর্তাকে প্রত্যয়িত করে না, অপরাধ নির্ধারণ করে না, আইনি পরামর্শ দেয় না বা নিরাপত্তার নিশ্চয়তা দেয় না। চাকরির প্রস্তাব স্বাধীনভাবে যাচাই করুন এবং প্রয়োজনে বিশ্বস্ত সহায়তা নিন। মিথ্যা তথ্য, হয়রানি বা প্রকাশ্যে ভিত্তিহীন অভিযোগের জন্য এটি ব্যবহার করবেন না। প্রকাশের আগে প্রযোজ্য আইন অনুযায়ী এই খসড়া শর্ত পর্যালোচনা করা দরকার।",
    privacyBody:"API চালু থাকলে এই প্রোটোটাইপ অ্যাকাউন্টের ইমেল ও পর্যালোচনার তথ্য SQLite ডেটাবেসে রাখে। পাসওয়ার্ডের salted hash সংরক্ষিত হয় এবং টোকেনের hash ডেটাবেসে থাকে। পর্যালোচনার তথ্য লগ-ইন করা অ্যাকাউন্টে সংরক্ষিত হয়। সংবেদনশীল পরিচয়পত্র, ব্যাংক, চিকিৎসা বা নির্দিষ্ট অবস্থানের তথ্য দেবেন না। স্বয়ংক্রিয় অ্যাকাউন্ট মুছে ফেলা, ইমেল যাচাই, অ্যাকাউন্ট পুনরুদ্ধার ও পূর্ণাঙ্গ নিরাপত্তা ব্যবস্থা এখনও নেই। বাস্তব তথ্য দেওয়ার আগে প্রকল্প দলের সঙ্গে যোগাযোগ করুন।",
    safety:"তাৎক্ষণিক বিপদে থাকলে সম্ভব হলে নিরাপদ জনসমাগমস্থলে যান এবং স্থানীয় জরুরি পরিষেবার সঙ্গে যোগাযোগ করুন। এতে বিপদ বাড়তে পারে এমন হলে নিয়োগকারীর মুখোমুখি হবেন না।"
  },
  hi: {
    navHome:"होम", navOffer:"नौकरी का प्रस्ताव जाँचें", navCompare:"शर्तों की तुलना", navSupport:"सहायता खोजें",
    navLegal:"कानूनी जानकारी", title:"नौकरी स्वीकार करने से पहले शर्तें समझें।",
    intro:"उपलब्ध जानकारी देखें, अनुपस्थित विवरण पहचानें और काम की शर्तों में बदलाव दर्ज करें। क्या साझा करना है, यह आपका निर्णय है।",
    check:"नौकरी का प्रस्ताव जाँचें", compare:"शर्तों की तुलना", support:"सहायता खोजें", language:"भाषा",
    note:"सुरक्षा सेतु जानकारीपरक चेकलिस्ट है। यह नियोक्ता की पुष्टि या नौकरी की सुरक्षा की गारंटी नहीं देता।",
    login:"लॉग इन", register:"खाता बनाएँ", email:"ईमेल पता", password:"पासवर्ड (कम से कम 10 अक्षर)",
    logout:"लॉग आउट", welcome:"आपका कार्यक्षेत्र", saveLogin:"आगे बढ़ें", jobTitle:"नौकरी का पद", recruiter:"भर्तीकर्ता या एजेंसी का नाम",
    salary:"वादा किया गया वेतन", period:"वेतन अवधि", hours:"प्रतिदिन काम के घंटे", location:"काम का स्थान",
    deductions:"क्या कटौतियाँ लिखित रूप में समझाई गई हैं?", contract:"क्या लिखित अनुबंध है?", fee:"क्या पहले से शुल्क माँगा गया है?",
    accommodation:"क्या रहने की व्यवस्था तय है?", yes:"हाँ", no:"नहीं", unknown:"पता नहीं / नहीं बताया गया",
    analyse:"जानकारी जाँचें", result:"जाँच का परिणाम", missing:"स्पष्ट की जाने वाली जानकारी", flags:"समीक्षा के विषय",
    promisedSalary:"वादा किया गया वेतन", actualSalary:"वास्तविक वेतन", promisedHours:"वादा किए गए घंटे/दिन", actualHours:"वास्तविक घंटे/दिन",
    promisedLocation:"वादा किया गया स्थान", actualLocation:"वास्तविक स्थान", promisedDeductions:"वादा की गई कटौतियाँ", actualDeductions:"वास्तविक कटौतियाँ",
    promisedAccommodation:"वादा किया गया आवास", actualAccommodation:"वास्तविक आवास", compareBtn:"शर्तों की तुलना करें",
    discrepancies:"अंतर मिले", noDiff:"दर्ज विवरण में अंतर नहीं मिला। सभी शर्तों की जाँच करें।",
    upload:"प्रस्ताव की तस्वीर से पाठ निकालें", extract:"पाठ निकालें", extracted:"निकाला गया पाठ (जाँचें और सुधारें)",
    supportTitle:"सहायता और आधिकारिक संसाधन", supportNote:"वर्तमान संपर्क विवरण और उपलब्धता आधिकारिक स्रोत पर जाँचें।",
    terms:"नियम और शर्तें", privacy:"गोपनीयता नीति", about:"सुरक्षा सेतु के बारे में", saved:"सहेजी गई जाँच",
    offline:"आप ऑफ़लाइन हो सकते हैं। ऐप का कुछ भाग और मार्गदर्शन उपलब्ध रह सकता है; खाते और विश्लेषण के लिए कनेक्शन चाहिए।",
    error:"कुछ गड़बड़ हुई", loading:"कृपया प्रतीक्षा करें…", delete:"हटाएँ", empty:"अभी कोई जाँच सहेजी नहीं गई है।",
    termsBody:"सुरक्षा सेतु एक जानकारीपरक प्रोटोटाइप है। यह उपयोगकर्ता द्वारा दर्ज जानकारी के आधार पर अनुपस्थित विवरण और संभावित अंतर दिखाता है। यह नियोक्ताओं को प्रमाणित नहीं करता, अपराध निर्धारित नहीं करता, कानूनी सलाह नहीं देता और सुरक्षा की गारंटी नहीं देता। प्रस्ताव की स्वतंत्र रूप से पुष्टि करें और आवश्यकता होने पर भरोसेमंद सहायता लें। इस मंच का उपयोग झूठी जानकारी, उत्पीड़न या सार्वजनिक आरोप लगाने के लिए न करें। सार्वजनिक उपयोग से पहले इन मसौदा शर्तों की लागू कानून के अनुसार समीक्षा होनी चाहिए।",
    privacyBody:"API चालू होने पर यह प्रोटोटाइप खाता ईमेल और जाँच का विवरण SQLite डेटाबेस में रखता है। पासवर्ड salted hash के रूप में और टोकन का hash डेटाबेस में रखा जाता है। जाँच का विवरण लॉग-इन खाते में सहेजा जाता है। संवेदनशील पहचान, बैंकिंग, चिकित्सा या सटीक स्थान की जानकारी न दें। स्व-सेवा खाता हटाना, ईमेल सत्यापन, खाता पुनर्प्राप्ति और पूर्ण सुरक्षा व्यवस्था अभी उपलब्ध नहीं हैं। वास्तविक निजी जानकारी देने से पहले परियोजना टीम से संपर्क करें।",
    safety:"तत्काल खतरे में हों तो संभव हो तो सुरक्षित सार्वजनिक स्थान पर जाएँ और स्थानीय आपातकालीन सेवाओं से संपर्क करें। यदि इससे खतरा बढ़ सकता है तो भर्तीकर्ता का सामना न करें।"
  }
};

function App() {
  const [lang,setLang] = useState("en");
  const t = copy[lang];
  const [page,setPage] = useState("home");
  const [token,setToken] = useState(localStorage.getItem("ss_token") || "");
  const [user,setUser] = useState(null);
  const [authMode,setAuthMode] = useState("login");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [result,setResult] = useState(null);
  const [researchReport,setResearchReport] = useState(null);
  const [saved,setSaved] = useState([]);
  const [support,setSupport] = useState([]);
  const [offer,setOffer] = useState({recruiter_name:"",job_title:"",salary:"",pay_period:"month",work_hours_per_day:"",deductions_explained:"",location:"",accommodation_promised:"",upfront_fee_requested:"",written_contract:""});
  const [compare,setCompare] = useState({promised_salary:"",actual_salary:"",promised_hours:"",actual_hours:"",promised_location:"",actual_location:"",promised_deductions:"",actual_deductions:"",promised_accommodation:"",actual_accommodation:""});
  const [ocrText,setOcrText] = useState("");
  const [ocrFile,setOcrFile] = useState(null);

  async function request(path, options={}) {
    const headers = {...(options.headers||{})};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !(options.body instanceof FormData)) headers["Content-Type"]="application/json";
    const response = await fetch(`${API}${path}`, {...options, headers});
    const data = await response.json().catch(()=>({detail:"The server returned an unreadable response."}));
    if (!response.ok) throw new Error(data.detail || "Request failed.");
    return data;
  }
  async function refresh() {
    if (!token) return;
    try {
      const me = await request("/api/me");
      setUser(me.user);
      setSaved(await request("/api/assessments"));
    } catch { setToken(""); localStorage.removeItem("ss_token"); setUser(null); }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    fetch(`${API}/api/support`).then(r=>r.json()).then(d=>setSupport(d.resources||[])).catch(()=>{});
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
  }, []);
  function signOut() { setToken(""); setUser(null); setSaved([]); localStorage.removeItem("ss_token"); setPage("home"); }
  async function submitAuth(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const data = await request(`/api/auth/${authMode==="register"?"register":"login"}`, {method:"POST",body:JSON.stringify({email,password})});
      setToken(data.token); localStorage.setItem("ss_token",data.token); setUser(data.user); setPage("home"); setPassword(""); setSaved([]);
    } catch(err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function analyse(e) {
    e.preventDefault(); setError(""); setResult(null); setBusy(true);
    try {
      const payload = {...offer, salary: offer.salary===""?null:Number(offer.salary), work_hours_per_day:offer.work_hours_per_day===""?null:Number(offer.work_hours_per_day),
        deductions_explained:offer.deductions_explained===""?null:offer.deductions_explained==="true",
        accommodation_promised:offer.accommodation_promised===""?null:offer.accommodation_promised==="true",
        upfront_fee_requested:offer.upfront_fee_requested===""?null:offer.upfront_fee_requested==="true",
        written_contract:offer.written_contract===""?null:offer.written_contract==="true"};
      const data = await request("/api/offer/analyse",{method:"POST",body:JSON.stringify(payload)});
      setResult(data); setSaved(await request("/api/assessments"));
    } catch(err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function runResearch() {
    setError(""); setBusy(true); setResearchReport(null);
    try {
      const payload = {...offer, salary: offer.salary===""?null:Number(offer.salary), work_hours_per_day:offer.work_hours_per_day===""?null:Number(offer.work_hours_per_day),
        deductions_explained:offer.deductions_explained===""?null:offer.deductions_explained==="true",
        accommodation_promised:offer.accommodation_promised===""?null:offer.accommodation_promised==="true",
        upfront_fee_requested:offer.upfront_fee_requested===""?null:offer.upfront_fee_requested==="true",
        written_contract:offer.written_contract===""?null:offer.written_contract==="true"};
      const data = await request("/api/research/report", {method:"POST", body:JSON.stringify(payload)});
      setResearchReport(data); setSaved(await request("/api/assessments"));
    } catch(err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function compareConditions(e) {
    e.preventDefault(); setError(""); setResult(null); setBusy(true);
    try {
      const payload = {...compare};
      ["promised_salary","actual_salary","promised_hours","actual_hours"].forEach(k=>payload[k]=compare[k]===""?null:Number(compare[k]));
      const data = await request("/api/conditions/compare",{method:"POST",body:JSON.stringify(payload)});
      setResult(data); setSaved(await request("/api/assessments"));
    } catch(err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function extractText(e) {
    e.preventDefault(); if(!ocrFile) return; setError(""); setBusy(true);
    try {
      const form = new FormData(); form.append("file",ocrFile);
      const data = await request("/api/ocr",{method:"POST",body:form});
      setOcrText(data.text || ""); setError(data.message || "");
    } catch(err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function deleteSaved(id) {
    try { await request(`/api/assessments/${id}`,{method:"DELETE"}); setSaved(saved.filter(s=>s.id!==id)); }
    catch(err){setError(err.message);}
  }
  const field = (label,value,onChange,opts={}) => <label className="field"><span>{label}</span><input value={value} onChange={e=>onChange(e.target.value)} type={opts.type||"text"} min={opts.min} max={opts.max} step={opts.step} required={opts.required||false} placeholder={opts.placeholder||""}/></label>;
  const select = (label,value,onChange,options) => <label className="field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}><option value="">{t.unknown}</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
  const booleanSelect = (label,value,onChange) => select(label,value,onChange,[{value:"true",label:t.yes},{value:"false",label:t.no}]);
  const displayResult = result && <section className="result" aria-live="polite"><h2>{t.result}</h2>{result.missing_information?.length>0&&<><h3>{t.missing}</h3><ul>{result.missing_information.map((x,i)=><li key={i}>{x}</li>)}</ul></>}{result.flags&&<><h3>{t.flags}</h3><ul>{result.flags.map((f,i)=><li key={i}><strong>{f.title}:</strong> {f.advice} <span className={`level ${f.level}`}>{f.level}</span></li>)}</ul></>}{result.discrepancies&&<><h3>{t.discrepancies}</h3>{result.discrepancies.length?<ul>{result.discrepancies.map((d,i)=><li key={i}><strong>{d.field}:</strong> {d.detail}</li>)}</ul>:<p>{t.noDiff}</p>}</>}{result.notice&&<p className="notice">{result.notice}</p>}</section>;

  const researchView = researchReport && <section className="research-report" aria-live="polite">
    <p className="kicker">EVIDENCE & FOLLOW-UP</p><h2>{researchReport.title}</h2>
    <p>{researchReport.mode_notice}</p>
    <div className="research-grid"><div className="donut-wrap"><div className="risk-donut" aria-label="Risk category chart">
      <svg viewBox="0 0 220 220" role="img" aria-label="Category attention scores"><circle cx="110" cy="110" r="76" fill="none" stroke="#e8e2d6" strokeWidth="25" />{researchReport.categories.reduce((acc,c)=>{const colors=["#b44d3e","#d8a24b","#527b6c","#7b8b9b","#9a9a8a","#c17d58"];const circumference=2*Math.PI*76;const total=researchReport.categories.reduce((sum,item)=>sum+Math.max(0,Number(item.score)||0),0);const value=Math.max(0,Number(c.score)||0);const rawLen=total>0?circumference*value/total:0;const gap=value>0?2:0;const len=Math.max(0,rawLen-gap);const el=value>0&&total>0?<circle key={c.name} cx="110" cy="110" r="76" fill="none" stroke={colors[acc.i%colors.length]} strokeWidth="25" strokeDasharray={`${len} ${circumference-len}`} strokeDashoffset={-acc.offset} transform="rotate(-90 110 110)" />:null;return {i:acc.i+1,offset:acc.offset+rawLen,els:[...acc.els,el]};},{i:0,offset:0,els:[]}).els}</svg><div className="donut-center"><strong>{researchReport.overall_attention}</strong><span>max attention</span></div></div><p className="small">Category scores are rule-based follow-up indicators, not a probability of harm.</p></div>
      <div className="category-list">{researchReport.categories.map((c,i)=><article key={c.name}><div className="category-heading"><strong>{c.name}</strong><span>{c.score}/100</span></div><div className="score-track"><span style={{width:`${c.score}%`}} /></div>{c.findings.map((f,j)=><p key={j}>{f}</p>)}</article>)}</div></div>
    <h3>Recommended next steps</h3><ol>{researchReport.next_steps.map((n,i)=><li key={i}>{n}</li>)}</ol>
    <h3>Official reference sources</h3><ul className="source-list">{researchReport.sources.map(s=><li key={s.url}><strong>{s.title}</strong><p>{s.relevance}</p><p className="small">Issuing authority: {s.authority}</p><a href={s.url} target="_blank" rel="noreferrer">{s.url}</a></li>)}</ul>
    <p className="notice">{researchReport.interpretation}</p>
  </section>;

  return <div className="app">
    <header className="topbar"><button className="wordmark" onClick={()=>setPage("home")}>SurakshaSetu</button>{user&&<nav aria-label="Main navigation">
      <button onClick={()=>setPage("home")}>{t.navHome}</button><button onClick={()=>setPage("offer")}>{t.navOffer}</button><button onClick={()=>setPage("compare")}>{t.navCompare}</button><button onClick={()=>setPage("support")}>{t.navSupport}</button>
    </nav>}{user&&<button type="button" className="signout-button" onClick={signOut}>{t.logout}</button>}<label className="language"><span>{t.language}</span><select value={lang} onChange={e=>setLang(e.target.value)}><option value="en">English</option><option value="bn">বাংলা</option><option value="hi">हिन्दी</option></select></label></header>
    {!navigator.onLine && <div className="offline-banner">{t.offline}</div>}
    <main>
      {error&&<div className="error" role="alert">{t.error}: {error}</div>}
      {!user && page!=="terms" && page!=="privacy" && page!=="support" && <section className="home-hero auth-hero"><div className="hero-slideshow" aria-hidden="true"><div className="hero-slide" /><div className="hero-slide" /><div className="hero-slide" /><div className="hero-slide" /><div className="hero-slide" /><div className="hero-slide" /></div><section className="auth-panel"><div><p className="kicker">SURAKSHASETU · FROM PROMISE TO PROTECTION</p><h1>{t.welcome}</h1><p>{t.note}</p><p className="lead">A clearer picture before you take a job.</p></div><form onSubmit={submitAuth} className="auth-form"><div className="tabs"><button type="button" className={authMode==="login"?"selected":""} onClick={()=>setAuthMode("login")}>{t.login}</button><button type="button" className={authMode==="register"?"selected":""} onClick={()=>setAuthMode("register")}>{t.register}</button></div>{field(t.email,email,setEmail,{type:"email",required:true})}{field(t.password,password,setPassword,{type:"password",required:true})}<button className="primary" disabled={busy}>{busy?t.loading:(authMode==="register"?t.register:t.login)}</button><p className="small">Prototype note: use a test email and do not enter sensitive personal information.</p></form></section></section>}
      {user && page==="home"&&<><section className="home-hero">
        <div className="hero-slideshow" aria-hidden="true">
          <div className="hero-slide" />
          <div className="hero-slide" />
          <div className="hero-slide" />
          <div className="hero-slide" />
          <div className="hero-slide" />
          <div className="hero-slide" />
        </div>
        <section className="intro"><p className="kicker">JOB OFFER REVIEW</p><h1>{t.title}</h1><p className="lead">{t.intro}</p><div className="actions"><button className="primary" onClick={()=>setPage("offer")}>{t.check}</button><button className="secondary" onClick={()=>setPage("compare")}>{t.compare}</button></div></section><section className="home-columns"><article><h2>{t.check}</h2><p>Review salary, hours, written terms, recruitment fees and location. See which details need clarification.</p><button className="text-button" onClick={()=>setPage("offer")}>Open job offer check</button></article><article><h2>{t.compare}</h2><p>Compare what was promised with what is happening now, and keep a private record in your account.</p><button className="text-button" onClick={()=>setPage("compare")}>Compare conditions</button></article><article><h2>{t.support}</h2><p>Find official support portals and practical next steps. Verify current details directly with the provider.</p><button className="text-button" onClick={()=>setPage("support")}>View support resources</button></article></section>{user&&<section className="saved"><h2>{t.saved}</h2>{saved.length===0?<p>{t.empty}</p>:<ul>{saved.map(s=><li key={s.id}>{s.kind} · {new Date(s.created_at*1000).toLocaleString()} <button className="text-button" onClick={()=>deleteSaved(s.id)}>{t.delete}</button></li>)}</ul>}</section>}<p className="notice">{t.note}</p></section></>}
      {page==="offer"&&<section className="page-section"><p className="kicker">I. OFFER REVIEW</p><h1>{t.check}</h1><form onSubmit={analyse} className="form-grid">{field(t.recruiter,offer.recruiter_name,v=>setOffer({...offer,recruiter_name:v}))}{field(t.jobTitle,offer.job_title,v=>setOffer({...offer,job_title:v}))}{field(t.salary,offer.salary,v=>setOffer({...offer,salary:v}),{type:"number",min:0,step:"any"})}<label className="field"><span>{t.period}</span><select value={offer.pay_period} onChange={e=>setOffer({...offer,pay_period:e.target.value})}><option value="month">Month</option><option value="week">Week</option><option value="day">Day</option></select></label>{field(t.hours,offer.work_hours_per_day,v=>setOffer({...offer,work_hours_per_day:v}),{type:"number",min:0,max:24,step:"0.5"})}{field(t.location,offer.location,v=>setOffer({...offer,location:v}))}{booleanSelect(t.deductions,offer.deductions_explained,v=>setOffer({...offer,deductions_explained:v}))}{booleanSelect(t.contract,offer.written_contract,v=>setOffer({...offer,written_contract:v}))}{booleanSelect(t.fee,offer.upfront_fee_requested,v=>setOffer({...offer,upfront_fee_requested:v}))}{booleanSelect(t.accommodation,offer.accommodation_promised,v=>setOffer({...offer,accommodation_promised:v}))}<div className="wide"><button className="primary" disabled={busy}>{busy?t.loading:t.analyse}</button></div></form>{displayResult}<div className="research-action"><button type="button" className="secondary" onClick={runResearch} disabled={busy}>{busy? t.loading : "Build evidence-backed report"}</button><p className="small">Uses your entered answers and curated official reference sources. Does not perform live web search or verify an employer.</p></div>{researchView}<section className="ocr"><h2>{t.upload}</h2><form onSubmit={extractText}><label className="field"><span>Image file (max 8 MB)</span><input type="file" accept="image/png,image/jpeg,image/webp,image/tiff,image/bmp" onChange={e=>setOcrFile(e.target.files?.[0]||null)}/></label><button className="secondary" disabled={busy||!ocrFile}>{t.extract}</button></form>{ocrText!==""&&<label className="field"><span>{t.extracted}</span><textarea rows="8" value={ocrText} onChange={e=>setOcrText(e.target.value)}/></label>}<p className="small">OCR may make mistakes. Review all extracted details manually. Never upload documents unless you are comfortable sharing them with this prototype.</p></section></section>}
      {page==="compare"&&<section className="page-section"><p className="kicker">II. CONDITIONS COMPARISON</p><h1>{t.compare}</h1><form onSubmit={compareConditions} className="form-grid">{field(t.promisedSalary,compare.promised_salary,v=>setCompare({...compare,promised_salary:v}),{type:"number",min:0,step:"any"})}{field(t.actualSalary,compare.actual_salary,v=>setCompare({...compare,actual_salary:v}),{type:"number",min:0,step:"any"})}{field(t.promisedHours,compare.promised_hours,v=>setCompare({...compare,promised_hours:v}),{type:"number",min:0,max:24,step:"0.5"})}{field(t.actualHours,compare.actual_hours,v=>setCompare({...compare,actual_hours:v}),{type:"number",min:0,max:24,step:"0.5"})}{field(t.promisedLocation,compare.promised_location,v=>setCompare({...compare,promised_location:v}))}{field(t.actualLocation,compare.actual_location,v=>setCompare({...compare,actual_location:v}))}{field(t.promisedDeductions,compare.promised_deductions,v=>setCompare({...compare,promised_deductions:v}))}{field(t.actualDeductions,compare.actual_deductions,v=>setCompare({...compare,actual_deductions:v}))}{field(t.promisedAccommodation,compare.promised_accommodation,v=>setCompare({...compare,promised_accommodation:v}))}{field(t.actualAccommodation,compare.actual_accommodation,v=>setCompare({...compare,actual_accommodation:v}))}<div className="wide"><button className="primary" disabled={busy}>{busy?t.loading:t.compareBtn}</button></div></form>{displayResult}</section>}
      {page==="support"&&<section className="page-section"><p className="kicker">III. SUPPORT DIRECTORY</p><h1>{t.supportTitle}</h1><p>{t.supportNote}</p><p className="warning">{t.safety}</p>{support.length?<ul className="resource-list">{support.map(r=><li key={r.url}><h2>{r.name}</h2><p>{r.detail}</p><a href={r.url} target="_blank" rel="noreferrer">{r.url}</a></li>)}</ul>:<p>Support directory could not be loaded. Check your connection and use trusted official channels.</p>}</section>}
      {page==="terms"&&<section className="legal"><p className="kicker">IV. LEGAL INFORMATION</p><h1>{t.terms}</h1><p className="small">Draft for prototype review. Last updated: 25 October 2026.</p><p>{t.termsBody}</p><h2>I. Informational purpose</h2><p>All results depend on information entered by the user and the rules implemented in this prototype. No result is a legal determination.</p><h2>II. User responsibility</h2><p>Use the service lawfully, avoid entering information about other people without a proper basis, and do not rely on this service as your only source of advice.</p><h2>III. Third-party services</h2><p>External websites are operated by their respective organisations. Check their current terms, contact information and availability.</p><h2>IV. Availability and changes</h2><p>The prototype may be unavailable, incomplete or changed without notice. These draft terms require legal review before public launch.</p></section>}
      {page==="privacy"&&<section className="legal"><p className="kicker">IV. LEGAL INFORMATION</p><h1>{t.privacy}</h1><p className="small">Draft for prototype review. Last updated: 25 October 2026.</p><p>{t.privacyBody}</p><h2>I. Information processed</h2><p>Account email, password hash, temporary bearer-token hash and assessment fields/results may be stored by the backend.</p><h2>II. Purpose</h2><p>Information is used to authenticate users, run requested checks and display saved assessments.</p><h2>III. Sharing and external links</h2><p>This prototype does not intentionally send assessment data to external support sites. Clicking an external link takes you to that third-party site.</p><h2>IV. Your choices</h2><p>Do not enter sensitive information. The prototype currently lacks self-service account deletion; add a secure deletion workflow before real deployment.</p><h2>V. Security and changes</h2><p>Reasonable prototype measures do not make this production-ready. Review security, retention, consent and applicable law before public launch.</p></section>}
    </main>
    <footer><div className="footer-name">SurakshaSetu</div><p>Clearer information. Informed choices.</p><div className="footer-links"><button onClick={()=>setPage("terms")}>{t.terms}</button><button onClick={()=>setPage("privacy")}>{t.privacy}</button><button onClick={()=>setPage("support")}>{t.support}</button></div><p className="small">A prototype for information and support. Not an emergency service.</p>{user&&<button className="text-button" onClick={signOut}>{t.logout}</button>}</footer>
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
