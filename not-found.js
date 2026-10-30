/* The zero follows a nearby pointer, without an animation loop. */
(() => {
  // Keep in-page navigation on the requested URL despite the root asset base.
  for(const link of document.querySelectorAll('a[href="404.html#main"],a[href="404.html#top"]'))link.href=location.pathname+location.search+'#'+link.getAttribute('href').split('#')[1];
  const art=document.querySelector('.error404-art'),face=document.querySelector('.error404-face');
  if(!art||!face)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
  const reset=()=>{cancelAnimationFrame(frame);face.style.removeProperty('--eye-x');face.style.removeProperty('--eye-y')};
  art.addEventListener('pointermove',event=>{
    if(reduced.matches||event.pointerType==='touch')return;
    cancelAnimationFrame(frame);
    const r=art.getBoundingClientRect(),x=Math.max(-1,Math.min(1,(event.clientX-r.left)/r.width*2-1)),y=Math.max(-1,Math.min(1,(event.clientY-r.top)/r.height*2-1));
    frame=requestAnimationFrame(()=>{face.style.setProperty('--eye-x',`${x*4}px`);face.style.setProperty('--eye-y',`${y*3}px`)})
  });
  art.addEventListener('pointerleave',reset);reduced.addEventListener('change',reset);
})();
