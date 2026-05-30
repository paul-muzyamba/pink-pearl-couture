// Navbar scroll
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 50));

  // Hamburger
  const ham = document.getElementById('ham');
  const mobileNav = document.getElementById('mobileNav');
  ham.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

  // Reveal observer
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Force reel video muted at all times
  const reelVideo = document.getElementById('reelVideo');
  if (reelVideo) {
    reelVideo.muted = true;
    reelVideo.volume = 0;
    reelVideo.addEventListener('volumechange', () => {
      if (!reelVideo.muted) { reelVideo.muted = true; reelVideo.volume = 0; }
    });
    reelVideo.addEventListener('play', () => {
      reelVideo.muted = true;
      reelVideo.volume = 0;
    });
  }

  // Catalogue filter
  function filterCat(btn, cat) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.product-card').forEach(card => {
      if (cat === 'all' || card.dataset.cat === cat) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Form submit
  function submitEnquiry() {
    const name = document.getElementById('cf-name').value.trim();
    const phone = document.getElementById('cf-phone').value.trim();
    const msg = document.getElementById('cf-msg').value.trim();
    if (!name || !phone || !msg) { alert('Please fill in your name, phone, and message.'); return; }
    // In production: send to Formspree or EmailJS
    // fetch('https://formspree.io/f/YOUR_ID', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name,phone,msg}) });
    document.getElementById('formBody').style.display = 'none';
    document.getElementById('form-success').style.display = 'block';
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth' }); }
    });
  });