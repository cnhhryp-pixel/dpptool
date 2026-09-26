document.addEventListener("DOMContentLoaded",async()=>{
  const gate=document.querySelector("#professional-gate");
  if(!gate)return;
  const access=await window.DPPProLicense?.getAccess();
  if(!access){
    gate.className="panel";
    gate.innerHTML='<span class="status amber">Professional locked</span><h2>A Professional Access Key is required</h2><p>Unlock this browser with the payment email and signed annual key.</p><div class="actions"><a class="btn primary" href="/professional-access/">Unlock Professional</a><a class="btn" href="/pricing/">View Pricing</a></div>';
    return;
  }
  gate.className="";
  gate.innerHTML='<div class="notice success"><strong>Professional active.</strong> License '+(access.licenseId||"Professional")+' is valid until '+access.exp+'.</div><div class="grid" style="margin-top:24px"><a class="card" href="/dpp-readiness/"><div class="icon">RPT</div><h3>Advanced readiness workflow</h3><p>Run the readiness assessment and prepare structured reporting/export workflows.</p></a><a class="card" href="/dpp-data-completeness/"><div class="icon">%</div><h3>Product data analysis</h3><p>Review product-data completeness before bulk preparation and reporting.</p></a><a class="card" href="/battery-passport-data-checker/"><div class="icon">BAT</div><h3>Battery specialist workflow</h3><p>Assess battery data before creating specialist Professional reports.</p></a></div><div class="notice" style="margin-top:24px"><strong>Professional V1:</strong> access control is active now. Advanced report generation, bulk analysis and export modules will be added behind this same Professional gate.</div>';
});