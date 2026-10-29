/* Static-site contact delivery. Confirmation is shown only after the service accepts a request. */
const labels={identite:'Identité visuelle',illustrations:'Illustrations',packaging:'Packaging',print:'Print',direction:'Direction artistique',digital:'Webdesign',interfaces:'Interfaces & UI/UX',campagnes:'Campagnes graphiques',social:'Réseaux sociaux',signaletique:'Signalétique',infographies:'Infographies',presentations:'Présentations',typographie:'Typographie',pictogrammes:'Pictogrammes',autre:'Autres créations graphiques'};
export function payloadFrom(data){
  const get=k=>String(data.get(k)||'').trim();
  return {_subject:`ESKIS — Nouveau projet · ${get('name').replace(/[\r\n]/g,' ').slice(0,100)}`,_template:'table',_replyto:get('email'),_url:'https://studio-eskis.fr/contact.html',_honey:get('_honey'),Nom:get('name'),email:get('email'),Profil:get('client_type')||'À préciser','Marque ou entreprise':get('company')||'À préciser',Prestation:get('services')||'À définir ensemble',Message:get('message')};
}
export function emailFallback(payload){
  const body=Object.entries(payload).filter(([k])=>!k.startsWith('_')).map(([k,v])=>`${k==='email'?'E-mail':k} : ${v}`).join('\n\n');
  return `mailto:contact@studio-eskis.fr?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(body)}`;
}
export async function deliver(payload,fetcher=fetch){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
    const r=await fetcher('https://formsubmit.co/ajax/contact@studio-eskis.fr',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},credentials:'omit',signal:controller.signal,body:JSON.stringify(payload)});
    if(!r.ok)throw new Error(`service-${r.status}`);
    const result=await r.json();
    if(result.success!==true&&result.success!=='true')throw new Error('service-rejected');
    if(/activat|verify|confirm.{0,40}(email|address)/i.test(result.message||''))throw new Error('activation-required');
    return result;
  }finally{clearTimeout(timer)}
}
export function initContact(form){
  const message=form.querySelector('#message'),count=form.querySelector('[data-message-count]'),limit=form.querySelector('#message-limit-status'),selected=form.querySelector('[data-selected-service]');
  const status=form.querySelector('[data-form-status]'),fallback=form.querySelector('[data-mail-fallback]'),button=form.querySelector('button[type=submit]'),label=button.querySelector('.metal-label');let pending=false;
  const service=new URLSearchParams(location.search).get('service');
  function selectService(){if(selected)selected.value=Object.hasOwn(labels,service)?labels[service]:''}
  function update(){if(message.value.length>1000)message.value=message.value.slice(0,1000);count.textContent=new Intl.NumberFormat('fr-FR').format(message.value.length);limit.textContent=message.value.length===1000?'Limite de 1 000 caractères atteinte.':''}
  selectService();update();form.addEventListener('reset',()=>requestAnimationFrame(()=>{update();selectService()}));
  form.addEventListener('input',()=>{
    update();
    if(status.dataset.state==='success'){status.textContent='';status.dataset.state='';button.disabled=false;label.textContent='Envoyer mon projet'}
    if(!fallback.hidden)fallback.querySelector('a').href=emailFallback(payloadFrom(new FormData(form)));
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(pending||!form.reportValidity())return;
    const payload=payloadFrom(new FormData(form));fallback.querySelector('a').href=emailFallback(payload);
    pending=true;button.disabled=true;form.setAttribute('aria-busy','true');label.textContent='Envoi en cours…';status.textContent='Votre message est en cours d’envoi.';status.dataset.state='pending';fallback.hidden=true;
    try{
      await deliver(payload);status.textContent='Votre demande a été transmise. Merci !';status.dataset.state='success';label.textContent='Demande transmise';form.reset();
    }catch(error){
      status.textContent='Nous n’avons pas pu confirmer l’envoi. Votre message est conservé ; vous pouvez nous écrire directement par e-mail.';status.dataset.state='error';status.dataset.reason=error.message;fallback.hidden=false;label.textContent='Réessayer l’envoi';button.disabled=false;status.focus({preventScroll:true});
    }finally{pending=false;form.removeAttribute('aria-busy')}
  });
}
