/* Contextual project return: preserve the source page, open folder and scroll position. */
(() => {
  const key='eskis-project-origin',pendingKey='eskis-project-restore';
  const file=url=>new URL(url,location.href).pathname.split('/').pop()||'index.html';
  const current=file(location.href),allowed=new Set(['index.html','projets.html','expertises.html']);
  const read=name=>{try{return JSON.parse(sessionStorage.getItem(name)||'null')}catch{return null}};
  const save=(name,value)=>{try{sessionStorage.setItem(name,JSON.stringify(value))}catch{}};
  const valid=value=>value&&allowed.has(file(value.url))&&new URL(value.url,location.href).origin===location.origin;
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const target=new URL(link.href,location.href);if(target.origin!==location.origin||!/^projet-[a-z0-9-]+\.html$/.test(file(target)))return;
    if(allowed.has(current)){
      const folder=link.closest('.glass-folder');
      const origin={url:current+(folder?current==='index.html'?'#services':`#${folder.id}`:location.hash),folder:folder?.id||null,scrollY:window.scrollY,project:file(target)};
      history.replaceState({...history.state,eskisProjectOrigin:origin},'',location.href);save(key,origin);
    }else{
      const origin=read(key);if(valid(origin)){origin.project=file(target);save(key,origin)}
    }
  });
  const back=document.querySelector('.project-back');
  if(back){
    const origin=read(key);
    if(valid(origin)&&origin.project===current){
      back.href=origin.url;
      back.setAttribute('aria-label',file(origin.url)==='index.html'?'Retour à l’accueil':file(origin.url)==='expertises.html'?'Retour aux services':'Retour aux projets');
      back.addEventListener('click',event=>{
        if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        save(pendingKey,origin);
        // Follow the explicit source URL, including after a chain of next-project links.
        // Referrers and history depth are unreliable after cached/back-forward restores.
      });
    }
  }
  function restore(){
    if(!allowed.has(current))return;
    const pending=read(pendingKey),origin=valid(pending)&&file(pending.url)===current?pending:history.state?.eskisProjectOrigin;
    if(!valid(origin)||file(origin.url)!==current)return;
    try{sessionStorage.removeItem(pendingKey)}catch{}
    document.dispatchEvent(new CustomEvent('eskis:restore-folder',{detail:origin}));
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const old=document.documentElement.style.scrollBehavior;document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,Math.max(0,Number(origin.scrollY)||0));document.documentElement.style.scrollBehavior=old;
    }));
  }
  addEventListener('pageshow',restore);
})();
