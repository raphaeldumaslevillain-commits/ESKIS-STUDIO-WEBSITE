/* Eskis — custom orchestration; LiquidGlass refraction adapted from manfromexistence via 21st.dev. */
(() => {
  const root=document.documentElement;
  root.classList.add('js');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const themeButton=document.querySelector('.theme-toggle');
  function applyTheme(mode,save=false){
    root.dataset.theme=mode==='light'?'light':'dark';
    themeButton?.setAttribute('aria-label',mode==='dark'?'Passer au thème clair':'Passer au thème sombre');
    themeButton?.setAttribute('aria-pressed',String(mode==='light'));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',mode==='light'?'#f2efe7':'#171715');
    if(save){try{localStorage.setItem('eskis-theme',root.dataset.theme)}catch{}}
    window.dispatchEvent(new CustomEvent('eskis:theme',{detail:root.dataset.theme}));
  }
  applyTheme(root.dataset.theme);
  themeButton?.addEventListener('click',()=>applyTheme(root.dataset.theme==='dark'?'light':'dark',true));
  window.addEventListener('storage',e=>{if(e.key==='eskis-theme')applyTheme(e.newValue)});

  const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('main-nav');
  if(nav)nav.inert=true;
  function closeMenu(){
    menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Ouvrir le menu');document.querySelector('.header-pages')?.removeAttribute('inert');nav?.classList.remove('is-open');if(nav)nav.inert=true;
    document.body.classList.remove('menu-open');document.querySelector('main').inert=false;document.querySelector('.site-footer').inert=false;
  }
  menu?.addEventListener('click',()=>{
    const open=menu.getAttribute('aria-expanded')!=='true';
    if(!open){closeMenu();return}
    menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Fermer le menu');document.querySelector('.header-pages')?.setAttribute('inert','');nav.inert=false;nav.classList.add('is-open');document.body.classList.add('menu-open');
    document.querySelector('main').inert=true;document.querySelector('.site-footer').inert=true;
    nav.querySelector('a')?.focus({preventScroll:true});
  });
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{
    if(!nav?.classList.contains('is-open'))return;
    if(e.key==='Escape'){closeMenu();menu.focus()}
    if(e.key==='Tab'){
      const items=[themeButton,menu,...nav.querySelectorAll('a')].filter(Boolean),first=items[0],last=items.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });

  if('IntersectionObserver' in window){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}
    }),{threshold:.04});
    document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
  }else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

  // LiquidGlass's rounded rectangle SDF and smooth-step displacement,
  // adapted to a static control surface rather than a draggable lens.
  // https://21st.dev/@manfromexistence/components/liquid-glass
  function smoothStep(a,b,t){t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t)}
  function roundedRectSDF(x,y,width,height,radius){
    const qx=Math.abs(x)-width+radius,qy=Math.abs(y)-height+radius;
    return Math.min(Math.max(qx,qy),0)+Math.hypot(Math.max(qx,0),Math.max(qy,0))-radius;
  }
  if(!reduced.matches){
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.cssText='position:fixed;pointer-events:none';
    const defs=document.createElementNS(ns,'defs');svg.appendChild(defs);document.body.appendChild(svg);
    document.querySelectorAll('.floating-nav,.theme-toggle,.art-controls,.rate-card,.contact-rate').forEach((el,index)=>{
      const filter=document.createElementNS(ns,'filter');filter.id=`eskis-glass-${index}`;
      filter.setAttribute('filterUnits','userSpaceOnUse');filter.setAttribute('color-interpolation-filters','sRGB');
      const image=document.createElementNS(ns,'feImage');image.setAttribute('result','map');
      const displacement=document.createElementNS(ns,'feDisplacementMap');displacement.setAttribute('in','SourceGraphic');displacement.setAttribute('in2','map');displacement.setAttribute('xChannelSelector','R');displacement.setAttribute('yChannelSelector','G');
      filter.append(image,displacement);defs.appendChild(filter);
      let last='';
      const update=()=>{
        const rect=el.getBoundingClientRect(),w=Math.min(640,Math.round(rect.width)),h=Math.min(560,Math.round(rect.height));
        if(w<2||h<2||`${w},${h}`===last)return;last=`${w},${h}`;
        const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');if(!ctx)return;
        const data=ctx.createImageData(w,h),r=Math.min(28,h/2),scale=14;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){
          const px=x-w/2,py=y-h/2,d=roundedRectSDF(px,py,w/2,h/2,r),bend=1-smoothStep(0,14,-d);
          const gx=roundedRectSDF(px+.5,py,w/2,h/2,r)-roundedRectSDF(px-.5,py,w/2,h/2,r),gy=roundedRectSDF(px,py+.5,w/2,h/2,r)-roundedRectSDF(px,py-.5,w/2,h/2,r);
          const n=Math.hypot(gx,gy)||1,i=(y*w+x)*4;
          data.data[i]=(0.5+gx/n*bend*.48)*255;data.data[i+1]=(0.5+gy/n*bend*.48)*255;data.data[i+2]=128;data.data[i+3]=255;
        }
        ctx.putImageData(data,0,0);filter.setAttribute('width',String(w));filter.setAttribute('height',String(h));image.setAttribute('width',String(w));image.setAttribute('height',String(h));image.setAttribute('href',canvas.toDataURL());displacement.setAttribute('scale',String(scale));
        el.style.setProperty('--refraction',`url(#${filter.id})`);el.classList.add('has-refraction');
      };
      let timer;const observer=new ResizeObserver(()=>{clearTimeout(timer);timer=setTimeout(update,100)});observer.observe(el);
    });
  }

  const gallery=document.querySelector('[data-scroll-gallery]');
  let scrollFrame;
  function updateScroll(){
    scrollFrame=0;
    document.body.classList.toggle('has-scrolled',scrollY>80);
    if(!gallery||reduced.matches||innerWidth<=760)return;
    const rect=gallery.getBoundingClientRect(),distance=gallery.offsetHeight-innerHeight;
    const p=Math.max(0,Math.min(1,-rect.top/Math.max(1,distance))),slides=[...gallery.querySelectorAll('.gallery-slide')],phase=p*(slides.length-1);
    slides.forEach((slide,i)=>{
      const wipe=i===slides.length-1?0:Math.max(0,Math.min(1,phase-i))*100;
      slide.style.clipPath=`inset(0 0 ${wipe}% 0)`;
      const image=slide.querySelector('img');image.style.transform=`scale(${1.06-Math.max(0,Math.min(1,phase-i))*.06})`;
    });
    gallery.querySelector('.gallery-progress>span').style.transform=`scaleX(${p})`;
    gallery.querySelector('.gallery-counter>b').textContent=String(Math.min(slides.length,Math.floor(phase+.35)+1)).padStart(2,'0');
  }
  const requestScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll)};
  addEventListener('scroll',requestScroll,{passive:true});addEventListener('resize',requestScroll,{passive:true});reduced.addEventListener('change',requestScroll);requestScroll();

  if(fine.matches&&!reduced.matches){
    document.querySelectorAll('[data-magnetic]').forEach(el=>{
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.10}px,${(e.clientY-r.top-r.height/2)*.12}px)`});
      el.addEventListener('pointerleave',()=>{el.style.transform=''});
    });
    const cursor=document.querySelector('.project-cursor');let frame;
    document.querySelectorAll('.project-cover').forEach(el=>{
      el.addEventListener('pointerenter',()=>cursor?.classList.add('visible'));
      el.addEventListener('pointerleave',()=>cursor?.classList.remove('visible'));
      el.addEventListener('pointermove',e=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(cursor)cursor.style.transform=`translate(${e.clientX-40}px,${e.clientY-40}px)`})});
    });
    addEventListener('scroll',()=>cursor?.classList.remove('visible'),{passive:true});
  }

  const form=document.getElementById('quote-form');
  if(form)import('./contact.js?v=15.2').then(module=>module.initContact(form)).catch(()=>{
    // Native POST remains available if the progressive enhancement fails to load.
  });
  if(document.getElementById('sculpture')){
    import('./assets/scene.js').then(module=>module.initSculpture()).catch(()=>{document.getElementById('sculpture').classList.add('art-fallback')});
  }
})();
