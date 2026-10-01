// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Dropdown menu toggle
const dropdownBtn = document.getElementById('navDropdownBtn');
const navLinks = document.getElementById('navLinks');

dropdownBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  navLinks.classList.toggle('open');
  dropdownBtn.classList.toggle('open');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-dropdown')) {
    navLinks.classList.remove('open');
    dropdownBtn.classList.remove('open');
  }
});

// Close dropdown when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    dropdownBtn.classList.remove('open');
  });
});

// Scroll reveal animations
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});
revealElements.forEach(el => revealObserver.observe(el));

// Lightbox for screens (almost full screen on hover / click)
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.screen-card').forEach(card => {
  const openLightbox = () => {
    const src = card.getAttribute('data-full') || card.querySelector('img').src;
    lightboxImg.src = src;
    lightbox.classList.add('active');
  };
  card.addEventListener('mouseenter', openLightbox);
  card.addEventListener('click', openLightbox);
});

// Close lightbox
const closeLightbox = () => lightbox.classList.remove('active');
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ===== Sound effects (Web Audio API) =====
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3, startTime = 0) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
}

const soundEffects = {
  countdown: () => {
    // Beep beep beep (descending ticks)
    [880, 880, 880, 660].forEach((f, i) => {
      playTone(f, 0.12, 'square', 0.25, i * 0.35);
    });
  },
  correct: () => {
    // Happy ascending chime
    [523, 659, 784].forEach((f, i) => {
      playTone(f, 0.2, 'sine', 0.3, i * 0.12);
    });
  },
  wrong: () => {
    // Low buzz / fail sound
    playTone(200, 0.15, 'sawtooth', 0.25, 0);
    playTone(150, 0.25, 'sawtooth', 0.2, 0.15);
  },
  winning: () => {
    // Triumphant fanfare-like arpeggio
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((f, i) => {
      playTone(f, 0.22, 'triangle', 0.28, i * 0.13);
    });
  },
  levelup: () => {
    // Rising sparkle / power-up
    [392, 494, 587, 784, 988].forEach((f, i) => {
      playTone(f, 0.15, 'sine', 0.25, i * 0.08);
    });
  }
};

document.querySelectorAll('.sound-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.getAttribute('data-sound');
    if (soundEffects[type]) {
      soundEffects[type]();
      btn.classList.add('playing');
      setTimeout(() => btn.classList.remove('playing'), 600);
    }
  });
});

// ===== Animation demos (section 11) =====
function spawnParticles(container) {
  const colors = ['#22c55e', '#4ade80', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6'];
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const angle = (Math.PI * 2 * i) / 14;
    const dist = 60 + Math.random() * 80;
    p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    p.style.setProperty('--rot', (Math.random() * 360) + 'deg');
    p.style.background = colors[i % colors.length];
    p.style.left = (40 + Math.random() * 20) + '%';
    p.style.top = (40 + Math.random() * 20) + '%';
    p.style.animationDelay = (Math.random() * 0.15) + 's';
    container.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function playDemo(el, type) {
  if (el.classList.contains('playing')) return;
  el.classList.add('playing');
  if (type === 'correct') {
    const particles = el.querySelector('.particles');
    if (particles) spawnParticles(particles);
    if (typeof soundEffects !== 'undefined' && soundEffects.correct) soundEffects.correct();
  } else {
    if (typeof soundEffects !== 'undefined' && soundEffects.wrong) soundEffects.wrong();
  }
  setTimeout(() => el.classList.remove('playing'), 1200);
}

const correctDemo = document.getElementById('correctDemo');
const wrongDemo = document.getElementById('wrongDemo');
if (correctDemo) {
  correctDemo.addEventListener('click', () => playDemo(correctDemo, 'correct'));
  correctDemo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playDemo(correctDemo, 'correct'); }
  });
}
if (wrongDemo) {
  wrongDemo.addEventListener('click', () => playDemo(wrongDemo, 'wrong'));
  wrongDemo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playDemo(wrongDemo, 'wrong'); }
  });
}
