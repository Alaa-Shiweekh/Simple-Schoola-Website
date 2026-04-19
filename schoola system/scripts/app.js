/**
 * Schoola Academy — Shared Application Logic
 * Handles: storage, navigation, scroll behavior, reveal animations
 */

'use strict';

/* ============================================================
   Storage Module
   ============================================================ */
const Storage = (() => {
  const KEY = 'schoola_students';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  }

  function save(students) {
    try {
      localStorage.setItem(KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Storage write failed:', e);
    }
  }

  function add(student) {
    const students = load();
    students.push({ ...student, id: crypto.randomUUID(), createdAt: Date.now() });
    save(students);
    return students;
  }

  function remove(id) {
    const students = load().filter(s => s.id !== id);
    save(students);
    return students;
  }

  return { load, save, add, remove };
})();

/* ============================================================
   Navigation: scroll header + mobile toggle + smooth scroll
   ============================================================ */
function initNav() {
  const header   = document.getElementById('site-header');
  const toggle   = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  // Scroll header
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile toggle
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on backdrop click
    navLinks.addEventListener('click', e => {
      if (e.target === navLinks) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ============================================================
   Reveal on Scroll (IntersectionObserver)
   ============================================================ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
}

/* ============================================================
   Animated Counter
   ============================================================ */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const from = 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.round(from + (target - from) * ease);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target'), 10);
          animateCounter(entry.target, target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

/* ============================================================
   Init on DOM Ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initCounters();
});

// Export for other scripts
window.SchoolaStorage = Storage;
window.animateCounter = animateCounter;
