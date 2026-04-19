/**
 * Schoola Academy — Add Student Page Script
 * Handles form validation, live preview, submission, and stats
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form        = document.getElementById('studentForm');
  const nameInput   = document.getElementById('name');
  const ageInput    = document.getElementById('age');
  const gradeInput  = document.getElementById('grade');
  const depSelect   = document.getElementById('dep');
  const toast       = document.getElementById('toast');
  const toastMsg    = document.getElementById('toast-msg');
  const resetBtn    = document.getElementById('resetBtn');

  // Preview elements
  const previewCard   = document.getElementById('previewCard');
  const previewName   = document.getElementById('previewName');
  const previewMeta   = document.getElementById('previewMeta');
  const previewGender = document.getElementById('previewGender');
  const previewAvatar = document.getElementById('previewAvatar');

  // Stats
  const totalCountEl = document.getElementById('totalCount');
  const todayCountEl = document.getElementById('todayCount');

  /* ---------- Validation Rules ---------- */
  const validators = {
    name(val) {
      if (!val.trim()) return 'Name is required.';
      if (val.trim().length < 2) return 'Name must be at least 2 characters.';
      if (val.trim().length > 80) return 'Name must be under 80 characters.';
      return '';
    },
    age(val) {
      const n = Number(val);
      if (!val) return 'Age is required.';
      if (!Number.isInteger(n) || n < 5 || n > 100) return 'Age must be between 5 and 100.';
      return '';
    },
    gender() {
      const checked = document.querySelector('input[name="gender"]:checked');
      if (!checked) return 'Please select a gender.';
      return '';
    },
    dep(val) {
      if (!val) return 'Please select a department.';
      return '';
    },
  };

  function showError(field, msg) {
    const errEl = document.getElementById(`${field}-error`);
    const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
    if (errEl) errEl.textContent = msg;
    if (input) input.classList.toggle('input-error', !!msg);
    if (input) input.classList.toggle('input-success', !msg && input.value);
  }

  function clearErrors() {
    ['name', 'age', 'gender', 'dep'].forEach(f => showError(f, ''));
  }

  function validateAll() {
    let valid = true;
    const fields = ['name', 'age', 'gender', 'dep'];
    fields.forEach(f => {
      const input = document.getElementById(f);
      const val   = input ? input.value : '';
      const err   = validators[f](val);
      showError(f, err);
      if (err) valid = false;
    });
    return valid;
  }

  /* ---------- Inline validation on blur ---------- */
  [nameInput, ageInput, depSelect].forEach(el => {
    if (!el) return;
    el.addEventListener('blur', () => {
      const err = validators[el.id]?.(el.value) || '';
      showError(el.id, err);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('input-error')) {
        const err = validators[el.id]?.(el.value) || '';
        showError(el.id, err);
      }
    });
  });

  document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', () => showError('gender', ''));
  });

  /* ---------- Live Preview ---------- */
  function updatePreview() {
    const name   = nameInput?.value.trim() || 'Student Name';
    const age    = ageInput?.value || '—';
    const dep    = depSelect?.value || '—';
    const grade  = gradeInput?.value || '—';
    const gender = document.querySelector('input[name="gender"]:checked')?.value || 'Gender';

    previewName.textContent   = name;
    previewMeta.textContent   = `Age ${age}  |  ${dep}  |  Grade ${grade}`;
    previewGender.textContent = gender;

    // Avatar initials
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    previewAvatar.innerHTML = initials.length > 0
      ? `<span style="font-family:var(--font-display);font-size:1.1rem;font-weight:600;color:var(--clr-accent)">${initials}</span>`
      : previewAvatar.innerHTML;

    previewCard.classList.toggle('preview-active',
      nameInput?.value.trim().length > 0
    );
  }

  [nameInput, ageInput, gradeInput, depSelect].forEach(el => {
    el?.addEventListener('input', updatePreview);
    el?.addEventListener('change', updatePreview);
  });
  document.querySelectorAll('input[name="gender"]').forEach(r => {
    r.addEventListener('change', updatePreview);
  });

  /* ---------- Stats ---------- */
  function updateStats() {
    const students = window.SchoolaStorage.load();
    const today    = new Date().toDateString();
    const todayCount = students.filter(s => {
      return s.createdAt && new Date(s.createdAt).toDateString() === today;
    }).length;

    if (totalCountEl) {
      window.animateCounter(totalCountEl, students.length, 600);
    }
    if (todayCountEl) {
      window.animateCounter(todayCountEl, todayCount, 600);
    }
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg, isError = false) {
    clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toast.classList.toggle('toast-error', isError);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* ---------- Form Submit ---------- */
  form?.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    if (!validateAll()) return;

    const student = {
      name:       nameInput.value.trim(),
      age:        Number(ageInput.value),
      gender:     document.querySelector('input[name="gender"]:checked').value,
      department: depSelect.value,
      grade:      gradeInput.value !== '' ? Number(gradeInput.value) : null,
    };

    window.SchoolaStorage.add(student);
    form.reset();
    updatePreview();
    updateStats();
    clearErrors();
    showToast(`${student.name} was registered successfully.`);
  });

  /* ---------- Reset Button ---------- */
  resetBtn?.addEventListener('click', () => {
    form.reset();
    clearErrors();
    updatePreview();
  });

  /* ---------- Init ---------- */
  updatePreview();
  updateStats();
});
