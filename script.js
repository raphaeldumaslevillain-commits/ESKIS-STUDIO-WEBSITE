/* Eskis — progressive enhancement; all pages and navigation work without JS. */
(() => {
  document.documentElement.classList.add('js');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  function closeMenu() {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) nav.querySelector('a')?.focus();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
    if (e.key === 'Tab' && nav?.classList.contains('is-open')) {
      const items = [menuButton, ...nav.querySelectorAll('a')];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    document.documentElement.classList.add('motion-enabled');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .06 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    reduceMotion.addEventListener('change', e => {
      if (e.matches) { document.documentElement.classList.remove('motion-enabled'); observer.disconnect(); }
    });
  }

  const cursor = document.querySelector('.cursor-label');
  if (cursor && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion.matches) {
    let frame;
    document.querySelectorAll('.project-cover').forEach(cover => {
      cover.addEventListener('pointerenter', () => cursor.classList.add('visible'));
      cover.addEventListener('pointerleave', () => cursor.classList.remove('visible'));
      cover.addEventListener('pointermove', e => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => { cursor.style.transform = `translate(${e.clientX - 46}px, ${e.clientY - 46}px)`; });
      });
    });
    window.addEventListener('scroll', () => cursor.classList.remove('visible'), { passive: true });
  }

  const filters = document.querySelectorAll('[data-filter]');
  filters.forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.filter;
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    document.querySelectorAll('.portfolio-grid .project-card').forEach(card => {
      const visible = value === 'all' || card.dataset.category.split(' ').includes(value);
      card.hidden = !visible;
      if (visible) { count++; card.classList.add('is-visible'); }
    });
    document.querySelector('.portfolio-grid')?.classList.toggle('filtered', value !== 'all');
    const status = document.getElementById('filter-status');
    if (status) status.textContent = `${count} projet${count > 1 ? 's' : ''} affiché${count > 1 ? 's' : ''}`;
  }));

  const form = document.getElementById('quote-form');
  const dialog = document.getElementById('brief-dialog');
  let brief = '';
  if (form) {
    const selected = new URLSearchParams(location.search).get('service');
    form.querySelectorAll('[data-service]').forEach(input => { input.checked = input.dataset.service === selected; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const choices = data.getAll('services');
      brief = [
        'ESKIS — DEMANDE DE DEVIS',
        'Document préparé dans le site de démonstration. Aucun message envoyé.',
        '', `Nom : ${data.get('name')}`, `E-mail : ${data.get('email')}`,
        `Entreprise / projet : ${data.get('company') || 'Non renseigné'}`,
        '', `Prestations : ${choices.length ? choices.join(', ') : 'À définir ensemble'}`,
        `Budget : ${data.get('budget')}`, `Calendrier : ${data.get('timing')}`,
        '', 'LE PROJET', data.get('message')
      ].join('\n');
      document.getElementById('brief-preview').textContent = brief;
      dialog.showModal();
      dialog.querySelector('.dialog-close').focus();
    });
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.dialog-back').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close();
    }});
    document.getElementById('download-brief').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob(['\uFEFF' + brief], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url; link.download = 'mon-brief-eskis.txt';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
})();
