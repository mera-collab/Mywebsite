/* ============================
   Helper / DOM cached nodes
   ============================ */
const htmlEl = document.documentElement;
const themeButtons = document.querySelectorAll('#theme-toggle, #theme-toggle-2, #theme-toggle-3, #theme-toggle-4, #theme-toggle-5');
const mobileBtns = document.querySelectorAll('#mobile-menu-btn, #mobile-menu-btn-2, #mobile-menu-btn-3, #mobile-menu-btn-4, #mobile-menu-btn-5');
const mobileMenus = document.querySelectorAll('#mobile-menu, #mobile-menu-2, #mobile-menu-3, #mobile-menu-4, #mobile-menu-5');

/* =================
   THEME TOGGLER
   - persists choice in localStorage
   ================= */
function applyTheme(theme){
  if(theme === 'light') htmlEl.classList.add('light-theme');
  else htmlEl.classList.remove('light-theme');
  localStorage.setItem('lens_theme', theme);
}

function initTheme(){
  const stored = localStorage.getItem('lens_theme');
  if(stored) applyTheme(stored);
  else {
    // default: prefer dark, but if user OS prefers light, set light
    const osLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(osLight ? 'light' : 'dark');
  }
}

themeButtons.forEach(btn => btn.addEventListener('click', () => {
  const isLight = htmlEl.classList.contains('light-theme');
  applyTheme(isLight ? 'dark' : 'light');
}));

/* ================
   MOBILE MENU TOGGLE
   ================ */
mobileBtns.forEach((btn, idx) => {
  const menu = mobileMenus[idx];
  if(!menu) return;
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
    menu.style.display = menu.classList.contains('open') ? 'flex' : 'none';
  });
});

/* ============================
   HERO SLIDESHOW (index.html)
   - uses an array of slides
   - fades between slides
   ============================ */
(function heroSlideshow(){
  const container = document.getElementById('hero-slideshow');
  if(!container) return;

  const slides = [
    { src: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=2000&q=80', alt: 'Photographer at work' },
    { src: 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=2000&q=80', alt: 'Studio portrait' },
    { src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=2000&q=80', alt: 'Outdoor portrait' }
  ];

  slides.forEach((s, i) => {
    const sl = document.createElement('div');
    sl.className = 'hero-slide' + (i===0 ? ' active' : '');
    sl.style.backgroundImage = `url("${s.src}")`;
    sl.setAttribute('aria-hidden', i===0 ? 'false' : 'true');
    container.appendChild(sl);
  });

  let idx = 0;
  setInterval(() => {
    const nodes = container.querySelectorAll('.hero-slide');
    nodes[idx].classList.remove('active');
    idx = (idx + 1) % nodes.length;
    nodes[idx].classList.add('active');
  }, 6000);
})();

/* ====================
   PARALLAX subtle shapes
   ==================== */
(function parallax(){
  const hero = document.getElementById('hero');
  if(!hero) return;
  const p1 = hero.querySelector('.p1');
  const p2 = hero.querySelector('.p2');

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if(p1) p1.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
    if(p2) p2.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
  });
})();

/* =========================
   LAZY LOAD & SHIMMER REMOVAL
   - finds elements with .lazy and data-src
   - swaps src on load and fades in
   ========================= */
(function lazyLoad(){
  const lazyImgs = document.querySelectorAll('img.lazy');
  if('loading' in HTMLImageElement.prototype){
    // native lazyload
    lazyImgs.forEach(img => {
      img.setAttribute('loading', 'lazy');
      if(img.dataset.src) img.src = img.dataset.src;
      img.addEventListener('load', () => {
        img.style.opacity = '1';
        // remove parent's shimmer if present
        const parent = img.closest('.media');
        if(parent){
          const shimmer = parent.querySelector('.shimmer');
          if(shimmer) shimmer.remove();
        }
      });
    });
  } else {
    // fallback: IntersectionObserver
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const img = entry.target;
          if(img.dataset.src) img.src = img.dataset.src;
          img.addEventListener('load', () => {
            img.style.opacity = '1';
            const parent = img.closest('.media');
            if(parent){
              const shimmer = parent.querySelector('.shimmer');
              if(shimmer) shimmer.remove();
            }
          });
          observer.unobserve(img);
        }
      });
    }, {rootMargin: '200px'});
    lazyImgs.forEach(i => observer.observe(i));
  }
})();

/* ===================
   LIGHTBOX FOR GALLERY IMAGES
   =================== */
(function lightbox(){
  const lightbox = document.getElementById('lightbox');
  if(!lightbox) return;
  const lbImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lb-close');

  document.querySelectorAll('.gallery-img, .card-img, .avatar').forEach(img => {
    img.addEventListener('click', (e) => {
      const src = img.dataset ? (img.dataset.src || img.src) : img.src;
      lbImg.src = src;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  function closeLB(){
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
  }

  closeBtn && closeBtn.addEventListener('click', closeLB);
  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox) closeLB();
  });
})();

/* ============================
   FADE-IN ON SCROLL (intersection)
   ============================ */
(function revealOnScroll(){
  const sections = document.querySelectorAll('.section, .card, .stat, .t-slide, .pricing-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(ent => {
      if(ent.isIntersecting){
        ent.target.style.opacity = 1;
        ent.target.style.transform = 'none';
        obs.unobserve(ent.target);
      }
    });
  }, {threshold:0.12});
  sections.forEach(s => {
    s.style.opacity = 0;
    s.style.transform = 'translateY(18px)';
    obs.observe(s);
  });
})();

/* ===========================
   TESTIMONIALS CAROUSEL (simple)
   =========================== */
(function testimonials(){
  const carousel = document.getElementById('t-carousel');
  if(!carousel) return;
  const slides = carousel.querySelectorAll('.t-slide');
  let i = 0;
  function showIndex(idx){
    const w = carousel.clientWidth;
    carousel.scrollTo({left: idx * w, behavior: 'smooth'});
  }
  document.querySelectorAll('.t-btn.prev, .t-btn.next').forEach(btn => {
    btn.addEventListener('click', () => {
      if(btn.classList.contains('next')) i = (i + 1) % slides.length;
      else i = (i - 1 + slides.length) % slides.length;
      showIndex(i);
    });
  });
  // auto-advance
  setInterval(()=>{ i = (i+1) % slides.length; showIndex(i); }, 6000);
})();

/* ===========================
   CONTACT FORM (no backend)
   - shows friendly message and allows email fallback
   =========================== */
(function contactForm(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  const msg = document.getElementById('form-msg');
  const mailBtn = document.getElementById('mailto-fallback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = 'Form sent — (demo) We would send this to the site owner in a live setup.';
    form.reset();
    setTimeout(()=> msg.textContent = '', 4000);
  });

  mailBtn && mailBtn.addEventListener('click', ()=>{
    const name = form.querySelector('[name=name]').value || '';
    const subject = encodeURIComponent(form.querySelector('[name=subject]').value || 'Inquiry');
    const body = encodeURIComponent((form.querySelector('[name=message]').value || '') + '\n\nFrom: ' + name);
    window.location.href = `mailto:hello@lenscraft.example?subject=${subject}&body=${body}`;
  });
})();

/* ====================
   INIT
   ==================== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  // quick fade-in for items already visible
  document.querySelectorAll('.section').forEach(s => s.style.opacity = 1);
});
const stats = [
    { icon: Camera, value: "2,500+", label: "Photos Delivered" },
    { icon: Users, value: "500+", label: "Happy Clients" },
    { icon: Award, value: "15+", label: "Awards Won" },
    { icon: Heart, value: "100%", label: "Satisfaction" }
  ];

