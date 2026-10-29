/* Small colour accents respond to the pointer; no continuous animation loop. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  for(const mark of document.querySelectorAll('.chromatic-stamp')){
    const host=mark.closest('section')||mark.parentElement;let frame=0;
    host.addEventListener('pointermove',event=>{
      if(reduced.matches||event.pointerType==='touch')return;cancelAnimationFrame(frame);
      const r=host.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;
      frame=requestAnimationFrame(()=>{mark.style.setProperty('--accent-x',`${x*16}px`);mark.style.setProperty('--accent-y',`${y*16}px`);mark.style.setProperty('--accent-rotate',`${-12+x*30}deg`)})
    });
    host.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);mark.style.removeProperty('--accent-x');mark.style.removeProperty('--accent-y');mark.style.removeProperty('--accent-rotate')});
  }
})();
