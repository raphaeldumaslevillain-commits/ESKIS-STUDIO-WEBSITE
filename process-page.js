/* Orbital positioning and selection adapted from the supplied Radial Orbital Timeline. */
(() => {
  const host=document.querySelector('[data-orbital-process]');if(!host)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),system=host.querySelector('.orbital-system');
  const nodes=[...host.querySelectorAll('.orbital-node')],panel=host.querySelector('[role=tabpanel]');
  const next=host.querySelector('[data-process-next]');
  const steps=[
    ['On se rencontre.','Nous vous écoutons. Ensemble, nous précisons vos envies, vos objectifs et le cadre du projet.'],
    ['Nous cherchons le déclic.','Nous rassemblons les références, explorons plusieurs directions et construisons une intention visuelle.'],
    ['Les idées prennent forme.','Nous dessinons, composons et développons la piste choisie en un univers graphique cohérent.'],
    ['On affine ensemble.','Vos retours guident les derniers ajustements. Nous soignons les détails et chaque déclinaison.'],
    ['À vous de jouer.','Nous préparons les fichiers finaux et les repères nécessaires pour faire vivre votre nouvelle identité.']
  ];
  const mod=(n,m)=>(n%m+m)%m;
  let active=0,angle=-90,target=-90,radius=150,frame=0,last=0,visible=false,hover=false,focus=false,centering=false;
  const available=()=>visible&&!document.hidden&&!document.body.classList.contains('menu-open');
  const playing=()=>!centering&&!reduced.matches&&!hover&&!focus&&available();
  function controls(){
    host.classList.toggle('is-paused',!playing());
  }
  function render(){
    nodes.forEach((node,i)=>{
      const rad=(angle+i*360/nodes.length)*Math.PI/180;
      node.style.transform=`translate(-50%,-50%) translate3d(${radius*Math.cos(rad)}px,${radius*Math.sin(rad)}px,0)`;
      node.style.zIndex=String(Math.round(100+20*Math.sin(rad)));
    });
  }
  function loop(time){
    frame=0;if(!available())return;
    const dt=last?Math.min(40,time-last):16;last=time;
    if(playing()){angle+=dt*.006;target=angle}
    else angle+=(target-angle)*(1-Math.exp(-dt/85));
    if(Math.abs(target-angle)<.02){angle=target;if(centering){centering=false;controls()}}
    render();
    if(playing()||Math.abs(target-angle)>.02)frame=requestAnimationFrame(loop);
  }
  function wake(){
    cancelAnimationFrame(frame);frame=0;last=0;
    if(Math.abs(target-angle)<.02)centering=false;
    controls();
    if(reduced.matches){angle=target;centering=false;render();return}
    if(available()&&(playing()||Math.abs(target-angle)>.02))frame=requestAnimationFrame(loop);
  }
  function select(index,updateHash=true,moveFocus=false){
    active=mod(index,nodes.length);centering=true;
    const destination=-90-active*360/nodes.length;
    target=angle+mod(destination-angle+180,360)-180;
    nodes.forEach((node,i)=>{
      node.setAttribute('aria-selected',String(i===active));node.tabIndex=i===active?0:-1;
      node.classList.toggle('is-related',mod(i-active,nodes.length)===1||mod(i-active,nodes.length)===nodes.length-1);
    });
    panel.setAttribute('aria-labelledby',nodes[active].id);
    panel.querySelector('h2').textContent=steps[active][0];panel.querySelector('p').textContent=steps[active][1];
    next.textContent=active===nodes.length-1?'Reprendre au début':'Étape suivante';
    if(updateHash)history.replaceState(null,'',`#${nodes[active].id}`);
    if(moveFocus)nodes[active].focus({preventScroll:true});
    wake();
  }
  nodes.forEach((node,i)=>{
    node.addEventListener('click',()=>select(i));
    node.addEventListener('keydown',event=>{
      let selected;
      if(event.key==='ArrowRight'||event.key==='ArrowDown')selected=active+1;
      else if(event.key==='ArrowLeft'||event.key==='ArrowUp')selected=active-1;
      else if(event.key==='Home')selected=0;
      else if(event.key==='End')selected=nodes.length-1;
      if(selected!==undefined){event.preventDefault();select(selected,true,true)}
    });
  });
  next.addEventListener('click',()=>select(active+1));
  system.addEventListener('pointerenter',()=>{hover=true;wake()});
  system.addEventListener('pointerleave',()=>{hover=false;wake()});
  system.addEventListener('focusin',()=>{focus=true;wake()});
  system.addEventListener('focusout',event=>{focus=system.contains(event.relatedTarget);wake()});
  function resize(){radius=Math.min(185,system.clientWidth*.34,system.clientHeight*.34);system.style.setProperty('--orbit-radius',`${radius}px`);render()}
  new ResizeObserver(resize).observe(system);resize();
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake()},{threshold:.08}).observe(system);
  new MutationObserver(wake).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',wake);
  reduced.addEventListener('change',wake);
  function fromHash(){const index=nodes.findIndex(node=>`#${node.id}`===location.hash);if(index>=0)select(index,false)}
  select(0,false);fromHash();controls();
  addEventListener('hashchange',fromHash);
})();
