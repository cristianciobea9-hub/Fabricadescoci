(function(){
  'use strict';

  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

  function initNav(){
    const nav = document.querySelector('.site-nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = qsa('.nav-menu a');
    if(!nav || !links.length) return;

    function closeMenu(){
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      if(toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    function setInitialActive(){
      links.forEach(x => x.classList.remove('active'));
      let matched = false;
      links.forEach(link => {
        const target = (link.getAttribute('href') || '').split('#')[0].split('/').pop();
        if(!target) return;
        const normalized = target.toLowerCase();
        const base = normalized.replace('.html', '');
        if(normalized === currentPage || (currentPage === '' && normalized === 'index.html')){
          link.classList.add('active');
          matched = true;
          return;
        }
        if(!matched && base && base !== 'index' && currentPage.includes(base)){
          link.classList.add('active');
          matched = true;
        }
      });

      if(!matched && /banda/i.test(currentPage)){
        const productsLink = links.find(l => (l.getAttribute('href') || '').toLowerCase().includes('produse'));
        if(productsLink) productsLink.classList.add('active');
      }
    }

    setInitialActive();

    links.forEach(link => {
      link.addEventListener('click', function(){
        links.forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        closeMenu();
      });
    });

    if(toggle){
      toggle.addEventListener('click', function(){
        const isOpen = nav.classList.toggle('is-open');
        document.body.classList.toggle('nav-open', isOpen);
        this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if(window.innerWidth > 900){
        closeMenu();
      }
    });
  }

  function initSmoothScroll(){
    qsa('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e){
        const href = this.getAttribute('href');
        if(!href || href === '#') return;
        const target = document.getElementById(href.slice(1));
        if(target){
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function initReveal(){
    if(!('IntersectionObserver' in window)) return;
    const items = qsa('.reveal');
    if(!items.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    items.forEach((item, idx) => {
      const delay = Math.min(idx, 8) * 0.06;
      item.style.transitionDelay = delay + 's';
      obs.observe(item);
    });
  }

  function initProductCardsReveal(){
    const cards = qsa('#produse .product-card');
    if(!cards.length || !('IntersectionObserver' in window)) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced){
      cards.forEach(card => card.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach((card, idx) => {
      card.style.transitionDelay = `${Math.min(idx, 2) * 0.08}s`;
      obs.observe(card);
    });
  }

  function initProcesCardsReveal(){
    const cards = qsa('#proces .step-card');
    if(!cards.length || !('IntersectionObserver' in window)) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced){
      cards.forEach(card => card.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    cards.forEach((card, idx) => {
      card.style.transitionDelay = `${Math.min(idx, 3) * 0.1}s`;
      obs.observe(card);
    });
  }

  function initCompactCardsReveal(){
    const cards = qsa('.p-card');
    if(!cards.length || !('IntersectionObserver' in window)) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced){
      cards.forEach(card => card.classList.add('is-inview'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-inview');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach((card, idx) => {
      card.style.transitionDelay = `${Math.min(idx, 3) * 0.08}s`;
      obs.observe(card);
    });
  }

  function initHeaderAutoHide(){
    const logoWrap = document.querySelector('.header-top');
    const logoImg = document.querySelector('.header-logo img');
    const nav = document.querySelector('.header-nav');
    if(!logoWrap || !logoImg || !nav) return;

    let lastY = window.scrollY;
    let ticking = false;
    const threshold = 60;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    function update(){
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastY;
      const shouldHide = currentY > threshold && scrollingDown;

      if(prefersReduced.matches){
        logoImg.style.transition = 'none';
        logoWrap.style.transition = 'none';
      } else {
        logoImg.style.transition = '';
        logoWrap.style.transition = '';
      }

      if(shouldHide){
        logoImg.classList.add('is-hidden');
        logoWrap.classList.add('is-hidden');
      } else {
        logoImg.classList.remove('is-hidden');
        logoWrap.classList.remove('is-hidden');
      }

      lastY = currentY;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if(!ticking){
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initNav();
    initSmoothScroll();
    initReveal();
    initProductCardsReveal();
    initProcesCardsReveal();
    initHeaderAutoHide();
    initCompactCardsReveal();
  });
})();
