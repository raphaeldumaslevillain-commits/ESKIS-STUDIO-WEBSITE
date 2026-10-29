/* Visual recreation of kedhareswer's Glass Folder Cards preview, for ESKIS. */
(() => {
  const cards = [...document.querySelectorAll('.glass-folder')];
  if (!cards.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let opened;

  function setOpen(card, open, returnFocus = false) {
    const toggle = card.querySelector('.folder-toggle');
    const files = card.querySelector('.folder-files');
    card.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Fermer' : 'Ouvrir'} le dossier ${toggle.dataset.folderName}`);
    files.inert = !open;
    files.setAttribute('aria-hidden', String(!open));
    if (open) opened = card;
    else if (opened === card) opened = undefined;
    if (returnFocus) toggle.focus({preventScroll: true});
  }

  cards.forEach(card => {
    const toggle = card.querySelector('.folder-toggle');
    const assembly = card.querySelector('.folder-assembly');
    let frame = 0, bounds;
    setOpen(card, false);
    card.classList.add('folder-ready');
    toggle.addEventListener('click', () => {
      if (card.classList.contains('possibility-folder')) {
        if (opened) setOpen(opened, false);
        openPossibilities(card);
        return;
      }
      const open = !card.classList.contains('is-open');
      if (opened && opened !== card) setOpen(opened, false);
      setOpen(card, open);
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Escape' && opened === card) {
        event.preventDefault();
        setOpen(card, false, true);
      }
    });
    card.addEventListener('pointerenter', () => { bounds = card.getBoundingClientRect(); });
    card.addEventListener('pointermove', event => {
      if (!finePointer.matches || reduced.matches || event.pointerType === 'touch') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
        assembly.style.setProperty('--lean-y', `${(x - .5) * 14}deg`);
        assembly.style.setProperty('--lean-x', `${(.5 - y) * 10}deg`);
        assembly.style.setProperty('--shine-x', `${x * 100}%`);
        frame = 0;
      });
    });
    function resetLean() {
      cancelAnimationFrame(frame);
      assembly.style.removeProperty('--lean-x');
      assembly.style.removeProperty('--lean-y');
      assembly.style.removeProperty('--shine-x');
    }
    card.addEventListener('pointerleave', resetLean);
    reduced.addEventListener('change', resetLean);
  });

  if ('IntersectionObserver' in window) {
    const arrivals = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('folder-arrived');
      arrivals.unobserve(entry.target);
    }), {threshold: .16});
    cards.forEach(card => arrivals.observe(card));
    // Keep deep links immediately usable, including when entered before layout settles.
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target?.classList.contains('glass-folder')) target.classList.add('folder-arrived');
  } else cards.forEach(card => card.classList.add('folder-arrived'));

  document.addEventListener('eskis:restore-folder',event=>{
    const card=cards.find(item=>item.id===event.detail?.folder);
    if(!card||card.classList.contains('possibility-folder'))return;
    if(opened&&opened!==card)setOpen(opened,false);
    card.classList.add('folder-arrived');setOpen(card,true);
  });

  document.addEventListener('pointerdown', event => {
    if (opened && !opened.contains(event.target)) setOpen(opened, false);
  });

  const possibilities=document.getElementById('possibilities-dialog');
  let possibilityOrigin;
  function openPossibilities(card){
    if(!possibilities)return;
    possibilityOrigin=card;card.classList.add('is-open');
    card.querySelector('.folder-toggle').setAttribute('aria-expanded','true');
    possibilities.showModal();document.body.classList.add('possibilities-open');
    possibilities.querySelector('.possibilities-close').focus();
  }
  if(possibilities){
    possibilities.querySelector('.possibilities-close').addEventListener('click',()=>possibilities.close());
    possibilities.addEventListener('close',()=>{
      document.body.classList.remove('possibilities-open');
      if(possibilityOrigin){possibilityOrigin.classList.remove('is-open');const toggle=possibilityOrigin.querySelector('.folder-toggle');toggle.setAttribute('aria-expanded','false');toggle.focus({preventScroll:true})}
    });
    possibilities.addEventListener('click',event=>{if(event.target===possibilities){const r=possibilities.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)possibilities.close()}});
  }
})();
