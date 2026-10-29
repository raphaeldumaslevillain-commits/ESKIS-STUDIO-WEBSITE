/* ESKIS · source-based Horizon / orbital timeline; visual adaptations of 21st previews. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const horizon=document.getElementById('horizon');
  const heroCopy=document.querySelector('.horizon-content');
  const intro=document.querySelector('.animated-intro');
  let scrollFrame=0;
  function updateScroll(){
    scrollFrame=0;
    if(!reduced.matches){
      const r=horizon.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/(horizon.offsetHeight-innerHeight)));
      heroCopy.style.transform=`translateY(${-p*95}px) scale(${1+p*.16})`;
      heroCopy.style.opacity=String(1-Math.pow(p,1.8)*.92);
      const ir=intro.getBoundingClientRect(),q=Math.max(-1,Math.min(1,(ir.top-innerHeight*.25)/innerHeight));
      document.querySelector('.intro-floating-left').style.transform=`translateY(${q*75}px) rotate(${-15+q*8}deg)`;
      document.querySelector('.intro-floating-right').style.transform=`translateY(${-q*85}px) rotate(${13-q*7}deg)`;
    }else{heroCopy.style.transform='';heroCopy.style.opacity=''}
  }
  const requestScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll)};
  addEventListener('scroll',requestScroll,{passive:true});addEventListener('resize',requestScroll);reduced.addEventListener('change',requestScroll);requestScroll();
  import('./assets/horizon.js').then(m=>m.initHorizon()).catch(()=>{});

  const phrases=[...document.querySelectorAll('.phrase')];let wordIndex=0,wordTimer,wordVisible=false;
  function stopWords(){clearInterval(wordTimer);wordTimer=undefined}
  function startWords(){
    stopWords();if(reduced.matches||!wordVisible||document.hidden)return;
    wordTimer=setInterval(()=>{
      const previous=phrases[wordIndex];previous.classList.remove('active');previous.classList.add('exit');
      wordIndex=(wordIndex+1)%phrases.length;phrases[wordIndex].classList.remove('exit');phrases[wordIndex].classList.add('active');
    },2900);
  }
  new IntersectionObserver(entries=>{wordVisible=entries[0].isIntersecting;startWords()},{threshold:.15}).observe(intro);

  const stage=document.querySelector('.tilted-stage'),belt=document.querySelector('.tilted-belt'),cards=[...belt.querySelectorAll('.tilted-card')];
  let phase=1,galFrame=0,lastTime=0,galVisible=false,galleryFocused=false,cardWidth=300;
  const mod=(n,m)=>((n%m)+m)%m;
  function renderGallery(){
    cards.forEach((card,i)=>{
      const offset=mod(i-phase+cards.length/2,cards.length)-cards.length/2;
      const edge=Math.abs(offset),visible=edge<3.4;
      card.style.transform=`translate(-50%,-50%) translate3d(${offset*(cardWidth+20)}px,${-edge*edge*10}px,0) perspective(1000px) rotateY(${-offset*13}deg)`;
      card.style.opacity=visible?String(Math.max(0,Math.min(1,(3.4-edge)*1.6))):'0';
      card.style.pointerEvents=visible?'auto':'none';
      card.style.zIndex=String(Math.round(20-edge));
    });
  }
  function resizeGallery(){cardWidth=cards[0].getBoundingClientRect().width||300;const cssWidth=getComputedStyle(cards[0]).width;cardWidth=parseFloat(cssWidth)||cardWidth;renderGallery()}
  function galleryLoop(t){
    galFrame=0;if(!galVisible||galleryFocused||reduced.matches||document.hidden)return;
    if(lastTime)phase=mod(phase+Math.min(40,t-lastTime)*.00013,cards.length);
    lastTime=t;renderGallery();galFrame=requestAnimationFrame(galleryLoop);
  }
  function wakeGallery(){cancelAnimationFrame(galFrame);lastTime=0;if(galVisible&&!galleryFocused&&!reduced.matches&&!document.hidden)galFrame=requestAnimationFrame(galleryLoop)}
  function stepGallery(delta){phase=mod(Math.round(phase)+delta,cards.length);renderGallery();wakeGallery()}
  belt.addEventListener('focusin',e=>{const i=cards.indexOf(e.target.closest('.tilted-card'));if(i<0)return;galleryFocused=true;phase=i;renderGallery();wakeGallery()});
  belt.addEventListener('focusout',e=>{galleryFocused=belt.contains(e.relatedTarget);wakeGallery()});
  stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stepGallery(e.key==='ArrowRight'?1:-1);cards[Math.round(phase)].focus({preventScroll:true})}});
  new IntersectionObserver(entries=>{galVisible=entries[0].isIntersecting;wakeGallery()},{rootMargin:'100px'}).observe(stage);
  new ResizeObserver(resizeGallery).observe(stage);resizeGallery();wakeGallery();
  reduced.addEventListener('change',()=>{wakeGallery();startWords()});

  // Adapted from jatin-yadav05's supplied Radial Orbital Timeline:
  // angular positioning, related nodes, rotation and centering on selection.
  const process=document.getElementById('process-dialog'),nodes=[...process.querySelectorAll('.orbital-node')],system=process.querySelector('.orbital-system');
  const steps=[
    ['On se rencontre.','Nous vous écoutons. Ensemble, nous précisons vos envies, vos objectifs et le cadre du projet.'],
    ['Nous cherchons le déclic.','Nous rassemblons les références, explorons plusieurs directions et construisons une intention visuelle.'],
    ['Les idées prennent forme.','Nous dessinons, composons et développons la piste choisie en un univers graphique cohérent.'],
    ['On affine ensemble.','Vos retours guident les derniers ajustements. Nous soignons les détails et chaque déclinaison.'],
    ['À vous de jouer.','Nous préparons les fichiers finaux et les repères nécessaires pour faire vivre votre nouvelle identité.']
  ];
  let active=0,angle=-90,angleTarget=-90,orbitFrame=0,orbitTime=0,orbitAuto=false,origin;
  function renderOrbit(){
    const radius=innerWidth<=760?115:innerWidth<=1000?135:160;
    nodes.forEach((node,i)=>{
      const rad=(i/nodes.length*360+angle)*Math.PI/180;
      node.style.transform=`translate(-50%,-50%) translate(${radius*Math.cos(rad)}px,${radius*Math.sin(rad)}px)`;
      node.style.zIndex=String(Math.round(100+Math.cos(rad)*20));
      node.classList.toggle('is-related',Math.abs(i-active)===1);
      node.setAttribute('aria-expanded',String(i===active));
    });
  }
  function orbitLoop(t){
    orbitFrame=0;if(!process.open||document.hidden)return;
    const dt=orbitTime?Math.min(40,t-orbitTime):16;orbitTime=t;
    if(orbitAuto&&!reduced.matches){angle+=dt*.006;angleTarget=angle}
    else angle+=(angleTarget-angle)*(reduced.matches?1:.12);
    renderOrbit();
    if(orbitAuto&&!reduced.matches||Math.abs(angleTarget-angle)>.05)orbitFrame=requestAnimationFrame(orbitLoop);
  }
  function wakeOrbit(){cancelAnimationFrame(orbitFrame);orbitTime=0;if(process.open&&!document.hidden)orbitFrame=requestAnimationFrame(orbitLoop)}
  function selectStep(i){
    active=i;orbitAuto=false;const target=-90-i/nodes.length*360;
    angleTarget=angle+mod(target-angle+180,360)-180;
    const detail=document.getElementById('process-detail');detail.querySelector('h3').textContent=steps[i][0];detail.querySelector('p').textContent=steps[i][1];
    const next=(i+1)%steps.length,related=detail.querySelector('[data-related-step]');related.dataset.relatedStep=String(next);related.textContent=i===4?'Revoir le début ↻':'Explorer la suite →';
    renderOrbit();wakeOrbit();
  }
  nodes.forEach((node,i)=>node.addEventListener('click',()=>selectStep(i)));
  process.querySelector('[data-related-step]').addEventListener('click',e=>selectStep(Number(e.currentTarget.dataset.relatedStep)));
  function openProcess(button){origin=button;if(!process.open)process.showModal();document.body.classList.add('process-open');selectStep(0);process.querySelector('.process-close').focus()}
  document.querySelectorAll('[data-open-process]').forEach(button=>button.addEventListener('click',()=>openProcess(button)));
  function openProcessFromHash(){if(location.hash==='#deroulement')openProcess(null)}
  addEventListener('hashchange',openProcessFromHash);openProcessFromHash();
  process.querySelector('.process-close').addEventListener('click',()=>process.close());
  process.querySelector('[data-close-process]').addEventListener('click',()=>process.close());
  process.addEventListener('close',()=>{document.body.classList.remove('process-open');cancelAnimationFrame(orbitFrame);origin?.focus({preventScroll:true})});
  process.addEventListener('click',e=>{if(e.target===process){const r=process.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)process.close()}});
  addEventListener('resize',renderOrbit);renderOrbit();
  document.addEventListener('visibilitychange',()=>{startWords();wakeGallery();wakeOrbit()});
})();
