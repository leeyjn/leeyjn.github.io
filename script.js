(() => {
  'use strict';
  const root = document.documentElement;
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const header = document.querySelector('.topbar');
  const progress = document.querySelector('.reading-progress');
  const mobile = window.matchMedia('(max-width: 640px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listen = (query, fn) => query.addEventListener ? query.addEventListener('change', fn) : query.addListener(fn);
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = navLinks.map(link => ({link, section: document.querySelector(link.getAttribute('href'))})).filter(item => item.section);
  root.classList.add('js-enabled');

  function closeMenu(restoreFocus = false) {
    const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('span').textContent = '메뉴';
    nav.dataset.open = 'false';
    if (restoreFocus && wasOpen) menuButton.focus();
  }
  closeMenu();
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('span').textContent = open ? '닫기' : '메뉴';
    nav.dataset.open = String(open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu(true);
  });
  header.addEventListener('focusout', event => {
    if (mobile.matches && event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
  });
  listen(mobile, () => closeMenu());

  let frame = 0;
  function updateScroll() {
    frame = 0;
    const maxScroll = Math.max(1, root.scrollHeight - root.clientHeight);
    const ratio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    progress.style.transform = `scaleX(${ratio})`;
    let current = null;
    const boundary = header.getBoundingClientRect().height + 100;
    sections.forEach(item => {
      if (item.section.getBoundingClientRect().top <= boundary) current = item.link;
    });
    navLinks.forEach(link => {
      if (link === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', requestUpdate, {passive: true});
  window.addEventListener('resize', requestUpdate, {passive: true});
  window.addEventListener('load', requestUpdate);
  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', requestUpdate));
  if ('ResizeObserver' in window) new ResizeObserver(requestUpdate).observe(document.body);
  requestUpdate();

  // Content stays visible without scripting, observers, or animation support.
  const animations = new Set();
  if ('IntersectionObserver' in window && Element.prototype.animate) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveals.unobserve(entry.target);
        if (reducedMotion.matches) return;
        const animation = entry.target.animate(
          [{transform:'translateY(18px)',opacity:.55},{transform:'translateY(0)',opacity:1}],
          {duration:550,easing:'cubic-bezier(.2,.7,.2,1)'}
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
        animation.oncancel = () => animations.delete(animation);
      });
    }, {threshold:0,rootMargin:'0px 0px -24px 0px'});
    document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));
  }

  listen(reducedMotion, () => { if (reducedMotion.matches) animations.forEach(animation => animation.cancel()); });
})();
