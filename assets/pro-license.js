const DPP_PRO_PUBLIC_KEY_PEM=`-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEn8j28NeuojV1ZjxI/b1m7ZmJWjby
KrtrIovLki7CHfIRKycBLE8NZaO5Q3UgjYpb0Oepjua0p6Q8HhD2PtHH4A==
-----END PUBLIC KEY-----`;

function dppB64UrlToBytes(value){
  let s=value.replace(/-/g,"+").replace(/_/g,"/");
  while(s.length%4)s+="=";
  const bin=atob(s),out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return out;
}
function dppPemToBytes(pem){
  const b64=pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g,"");
  const bin=atob(b64),out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return out;
}
async function dppSha256Hex(value){
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function dppImportPublicKey(){
  return crypto.subtle.importKey("spki",dppPemToBytes(DPP_PRO_PUBLIC_KEY_PEM),{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
}
async function dppVerifyProfessionalLicense(license,email){
  const clean=(license||"").trim(),normalEmail=(email||"").trim().toLowerCase();
  const parts=clean.split(".");
  if(parts.length!==3||parts[0]!=="DPP1")throw new Error("Access key format is invalid.");
  const payloadPart=parts[1],sigPart=parts[2];
  let payload;
  try{payload=JSON.parse(new TextDecoder().decode(dppB64UrlToBytes(payloadPart)));}catch(e){throw new Error("Access key payload is invalid.");}
  if(payload.plan!=="professional")throw new Error("This key is not a Professional license.");
  if(!payload.exp)throw new Error("License expiry date is missing.");
  const exp=new Date(payload.exp+"T23:59:59Z");
  if(Number.isNaN(exp.getTime())||exp<new Date())throw new Error("This Professional access key has expired.");
  const emailHash=await dppSha256Hex(normalEmail);
  if(payload.emailHash!==emailHash)throw new Error("The email does not match this access key.");
  const key=await dppImportPublicKey();
  const ok=await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},key,dppB64UrlToBytes(sigPart),new TextEncoder().encode(payloadPart));
  if(!ok)throw new Error("The access key signature is invalid.");
  return payload;
}
function dppStoreProfessionalAccess(license,email,payload){
  localStorage.setItem("dpptool_pro_license",license.trim());
  localStorage.setItem("dpptool_pro_email",email.trim().toLowerCase());
  localStorage.setItem("dpptool_pro_payload",JSON.stringify(payload));
}
async function dppGetProfessionalAccess(){
  const license=localStorage.getItem("dpptool_pro_license"),email=localStorage.getItem("dpptool_pro_email");
  if(!license||!email)return null;
  try{return await dppVerifyProfessionalLicense(license,email);}catch(e){return null;}
}
function dppClearProfessionalAccess(){
  localStorage.removeItem("dpptool_pro_license");
  localStorage.removeItem("dpptool_pro_email");
  localStorage.removeItem("dpptool_pro_payload");
}
function dppRenderProfessionalStatus(payload){
  const result=document.querySelector("#pro-access-result");
  if(!result)return;
  if(!payload){result.className="panel result empty";result.innerHTML='<div><div class="icon" style="margin:auto">PRO</div><h2>Professional access is locked</h2><p>Enter the payment email and signed access key to unlock this browser.</p></div>';return;}
  result.className="panel result";
  result.innerHTML='<span class="status green">Professional active</span><h2>Access unlocked</h2><p><strong>License:</strong> '+(payload.licenseId||"Professional")+'</p><p><strong>Valid until:</strong> '+payload.exp+'</p><div class="notice success"><strong>This browser is unlocked.</strong> Professional tools can verify this signed access key without a traditional user-account backend.</div><button class="btn" id="pro-clear-access" type="button">Remove access from this browser</button>';
  document.querySelector("#pro-clear-access")?.addEventListener("click",()=>{dppClearProfessionalAccess();dppRenderProfessionalStatus(null);});
}
async function dppInitProfessionalAccess(){
  const form=document.querySelector("#pro-access-form");
  if(!form)return;
  const stored=await dppGetProfessionalAccess();
  dppRenderProfessionalStatus(stored);
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const email=document.querySelector("#pro-email").value,license=document.querySelector("#pro-key").value,result=document.querySelector("#pro-access-result");
    result.className="panel result";result.innerHTML='<span class="status blue">Checking</span><h2>Verifying access key…</h2>';
    try{
      const payload=await dppVerifyProfessionalLicense(license,email);
      dppStoreProfessionalAccess(license,email,payload);
      dppRenderProfessionalStatus(payload);
    }catch(err){
      result.className="panel result";
      result.innerHTML='<span class="status amber">Access not unlocked</span><h2>Check the email and access key</h2><p>'+String(err.message||err).replace(/</g,"&lt;")+'</p>';
    }
  });
}
window.DPPProLicense={verify:dppVerifyProfessionalLicense,getAccess:dppGetProfessionalAccess,clear:dppClearProfessionalAccess};
document.addEventListener("DOMContentLoaded",dppInitProfessionalAccess);
