import { readFileSync } from "node:fs";
import { createHash, randomUUID, sign } from "node:crypto";

const [,,emailArg,expiryArg,privateKeyPathArg]=process.argv;
if(!emailArg||!expiryArg||!privateKeyPathArg){
  console.error("Usage: node scripts/issue-professional-license.mjs customer@example.com 2027-09-26 /path/to/dpptool-professional-private-key.pem");
  process.exit(1);
}
if(!/^\d{4}-\d{2}-\d{2}$/.test(expiryArg)){
  console.error("Expiry must use YYYY-MM-DD.");
  process.exit(1);
}
const email=emailArg.trim().toLowerCase();
const emailHash=createHash("sha256").update(email).digest("hex");
const payload={
  v:1,
  plan:"professional",
  licenseId:"DPP-PRO-"+randomUUID().split("-")[0].toUpperCase(),
  emailHash,
  exp:expiryArg,
  iat:new Date().toISOString().slice(0,10)
};
const payloadPart=Buffer.from(JSON.stringify(payload)).toString("base64url");
const privateKey=readFileSync(privateKeyPathArg,"utf8");
const signature=sign("sha256",Buffer.from(payloadPart),{key:privateKey,dsaEncoding:"ieee-p1363"}).toString("base64url");
console.log("Customer email:",email);
console.log("Expires:",expiryArg);
console.log("License ID:",payload.licenseId);
console.log("\nProfessional Access Key:\n");
console.log("DPP1."+payloadPart+"."+signature);
