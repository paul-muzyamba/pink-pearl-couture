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

  // ── Send Enquiry Form — powered by Formspree ──────────────────────
  // Setup (one-time, 2 mins):
  //  1. Go to https://formspree.io and sign up for a free account
  //  2. Click "+ New Form" → give it a name (e.g. "Pink Pearl Enquiries")
  //  3. Copy the form ID from the endpoint (looks like "xabc1234")
  //  4. Replace YOUR_FORM_ID below with that ID — done!
  //  Free tier: 50 submissions/month. Notifications go to your Formspree email.
  // ────────────────────────────────────────────────────────────────────
  async function submitEnquiry() {
    const name     = document.getElementById('cf-name').value.trim();
    const phone    = document.getElementById('cf-phone').value.trim();
    const email    = document.getElementById('cf-email').value.trim();
    const interest = document.getElementById('cf-interest').value;
    const msg      = document.getElementById('cf-msg').value.trim();

    if (!name || !phone || !msg) {
      alert('Please fill in your name, phone number, and message.');
      return;
    }

    const btn      = document.querySelector('#formBody .btn-pink');
    const origText = btn.textContent;
    btn.disabled   = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch('https://formspree.io/f/xzdwnvgz', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify({ name, phone, email, interest, message: msg }),
      });

      if (res.ok) {
        document.getElementById('formBody').style.display     = 'none';
        document.getElementById('form-success').style.display = 'block';
      } else {
        const data = await res.json();
        throw new Error(data?.errors?.[0]?.message || 'Submission failed');
      }
    } catch {
      btn.disabled    = false;
      btn.textContent = origText;
      alert('Something went wrong. Please WhatsApp us directly at +260 979 690 009');
    }
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth' }); }
    });
  });