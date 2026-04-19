/**
 * Schoola Academy — Home Page Script
 * Canvas particle background + stat counter animations
 */

'use strict';

/* ============================================================
   Particle Canvas Background
   ============================================================ */
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles, animId;

  const PARTICLE_COUNT = window.innerWidth < 640 ? 40 : 80;
  const MAX_DIST = 120;

  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x:   Math.random() * width,
      y:   Math.random() * height,
      vx:  (Math.random() - 0.5) * 0.3,
      vy:  (Math.random() - 0.5) * 0.3,
      r:   Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Move particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width)  p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.08;
          ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 169, 110, ${p.opacity})`;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  init();
  draw();

  // Pause when tab hidden (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  });

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      init();
    }, 200);
  }, { passive: true });
}

/* ============================================================
   Live Student Count from Storage
   ============================================================ */
function initLiveStats() {
  const students = window.SchoolaStorage ? window.SchoolaStorage.load() : [];

  // Update hero cards with real data if students exist
  const totalEl = document.querySelector('.card-1 .card-number');
  if (totalEl && students.length > 0) {
    totalEl.setAttribute('data-target', students.length);
  }
}

/* ============================================================
   Smooth anchor scroll
   ============================================================ */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initLiveStats();
  initSmoothAnchors();
});
