/* =================================================
   MovieMania - main.js
   Nav, Swiper init, Blur header, Trailer modal,
   Play overlay injection, Theme toggle & persistence
   ================================================= */

/* ---------------------------
   Basic DOM helpers
   --------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ---------------------------
   NAV - open/close
   --------------------------- */
const nav = $('#nav');
const headerMenu = $('#header-menu');
const navClose = $('#nav-close');

if (headerMenu) headerMenu.addEventListener('click', () => nav.classList.add('show-menu'));
if (navClose) navClose.addEventListener('click', () => nav.classList.remove('show-menu'));

/* ---------------------------
   SWIPER inits
   (requires swiper-bundle.min.js included before this script)
   --------------------------- */
function initSwipers(){
  try{
    if(window.Swiper){
      /* Movie (popular) */
      new Swiper('.movie__swiper', {
        loop:true,grabCursor:true,spaceBetween:20,slidesPerView:2,
        breakpoints:{440:{slidesPerView:'auto'},768:{slidesPerView:4},1200:{slidesPerView:5}},
      });

      /* Trending (centered with pagination) */
      new Swiper('.new__swiper', {
        loop:true,grabCursor:true,centeredSlides:true,slidesPerView:1.2,spaceBetween:18,
        pagination:{ el:'.swiper-pagination', clickable:true },
        breakpoints:{440:{centeredSlides:false,slidesPerView:'auto'},768:{centeredSlides:false,slidesPerView:4},1200:{centeredSlides:false,slidesPerView:5}},
      });

      /* Favorites */
      new Swiper('.movie_swiper', {
        loop:true,grabCursor:true,spaceBetween:16,slidesPerView:2,
        breakpoints:{440:{slidesPerView:'auto'},768:{slidesPerView:4},1200:{slidesPerView:6}},
      });
    }
  }catch(e){ console.warn('Swiper init error', e); }
}
/* init when DOM ready */
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSwipers);
else initSwipers();

/* ---------------------------
   Blur header on scroll
   --------------------------- */
function blurHeader(){
  const header = $('#header');
  if(!header) return;
  if(window.scrollY >= 50) header.classList.add('blur-header');
  else header.classList.remove('blur-header');
}
window.addEventListener('scroll', blurHeader);
blurHeader();

/* ---------------------------
   Trailer Modal + Play overlay
   --------------------------- */
(function(){
  // Create references to modal elements (we expect they exist in HTML)
  const modal = document.getElementById('trailer-modal') || (function(){ return null; })();
  const iframe = document.getElementById('trailer-iframe');
  const closeBtn = document.getElementById('trailer-close');
  const backdrop = document.getElementById('trailer-backdrop');
  const errorEl = document.getElementById('trailer-error');

  function openModal(embedUrl){
    if(!modal) return;
    if(!embedUrl){
      if(errorEl) errorEl.hidden = false;
      if(iframe) iframe.src = '';
    } else {
      if(errorEl) errorEl.hidden = true;
      // ensure embed URL is clean (should be https://www.youtube.com/embed/VIDEO_ID)
      iframe.src = embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1&rel=0';
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    if(iframe) iframe.src = '';
    document.body.style.overflow = '';
  }

  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(backdrop) backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

  /* Add play buttons to anchors */
  function attachPlayButtons(){
    const anchors = $$('.card__link, .movie-card a');
    anchors.forEach(a => {
      // don't duplicate
      if(a.querySelector('.play-overlay')) return;

      // overlay wrapper
      const overlay = document.createElement('div');
      overlay.className = 'play-overlay';

      // button
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'play-btn';
      btn.title = 'Play trailer';
      btn.innerHTML = '▶';

      // click: read data-trailer attribute from anchor and open modal
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const trailer = a.getAttribute('data-trailer') || a.dataset.trailer;
        if(trailer) openModal(trailer);
        else {
          if(errorEl) errorEl.hidden = false;
          openModal(null);
          setTimeout(()=>{ if(errorEl) errorEl.hidden = true; }, 2200);
        }
      });

      overlay.appendChild(btn);
      // ensure anchor is positioned
      a.style.position = a.style.position || 'relative';
      a.appendChild(overlay);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachPlayButtons);
  else attachPlayButtons();

})();

/* ---------------------------
   Theme toggle (gold/cinematic)
   --------------------------- */
(function(){
  const THEME_KEY = 'moviemania_theme';
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');

  function isLight() { return document.body.classList.contains('light-theme'); }
  function setThemeLight(light){
    if(light) {
      document.body.classList.add('light-theme');
      if(icon) icon.className = 'ri-moon-line';
    } else {
      document.body.classList.remove('light-theme');
      if(icon) icon.className = 'ri-sun-line';
    }
    try{ localStorage.setItem(THEME_KEY, light ? 'light' : 'dark'); }catch(e){}
  }

  // init
  (function init(){
    let saved = null;
    try{ saved = localStorage.getItem(THEME_KEY); }catch(e){}
    if(saved === 'light'){ setThemeLight(true); return; }
    if(saved === 'dark'){ setThemeLight(false); return; }
    // fallback to prefers-color-scheme
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    setThemeLight(prefersLight);
  })();

  if(toggle){
    toggle.addEventListener('click', () => {
      setThemeLight(!isLight());
      // small tactile feedback
      toggle.animate([{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:160});
    });
  }
})();

/* ---------------------------
   Utility: ensure external links open safely (optional)
   --------------------------- */
(function safeExternalLinks(){
  $$('a[target="_blank"]').forEach(a=>{
    if(!a.rel.includes('noopener')) a.rel = (a.rel + ' noopener noreferrer').trim();
  });
})();
