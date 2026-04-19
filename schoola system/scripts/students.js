/**
 * Schoola Academy — Students Page Script
 * Handles: table rendering, mobile cards, search, filter, sort,
 *          stats bar, CSV export, delete confirmation modal,
 *          column header sorting with direction toggle
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- DOM References ---------- */
  const searchInput       = document.getElementById('search');
  const searchClear       = document.getElementById('searchClear');
  const depFilter         = document.getElementById('departmentFilter');
  const genderFilter      = document.getElementById('genderFilter');
  const sortSelect        = document.getElementById('sort');
  const clearFiltersBtn   = document.getElementById('clearFilters');
  const exportBtn         = document.getElementById('exportBtn');
  const tableBody         = document.getElementById('tableBody');
  const cardList          = document.getElementById('cardList');
  const emptyState        = document.getElementById('emptyState');
  const emptyTitle        = document.getElementById('emptyTitle');
  const emptyMsg          = document.getElementById('emptyMsg');
  const resultsCount      = document.getElementById('resultsCount');
  const deleteModal       = document.getElementById('deleteModal');
  const deleteStudentName = document.getElementById('deleteStudentName');
  const confirmDeleteBtn  = document.getElementById('confirmDelete');
  const cancelDeleteBtn   = document.getElementById('cancelDelete');

  // Stats bar
  const sbTotal  = document.getElementById('sb-total');
  const sbMale   = document.getElementById('sb-male');
  const sbFemale = document.getElementById('sb-female');
  const sbAvg    = document.getElementById('sb-avg');
  const sbDeps   = document.getElementById('sb-deps');

  /* ---------- State ---------- */
  let sortCol       = 'name';
  let sortDirection = 'asc'; // 'asc' | 'desc'
  let pendingDeleteId = null;

  /* ---------- Helpers ---------- */
  function getFiltered() {
    const students = window.SchoolaStorage.load();
    const query    = (searchInput?.value || '').toLowerCase().trim();
    const dep      = depFilter?.value || 'All';
    const gender   = genderFilter?.value || 'All';

    return students.filter(s => {
      const matchName   = s.name.toLowerCase().includes(query);
      const matchDep    = dep === 'All' || s.department === dep;
      const matchGender = gender === 'All' || s.gender === gender;
      return matchName && matchDep && matchGender;
    });
  }

  function getSorted(list) {
    const col = sortCol;
    const dir = sortDirection === 'asc' ? 1 : -1;

    return [...list].sort((a, b) => {
      let va = a[col] ?? '';
      let vb = b[col] ?? '';

      // Numeric sort for age / grade
      if (col === 'age' || col === 'grade') {
        va = Number(va) || 0;
        vb = Number(vb) || 0;
        return dir * (va - vb);
      }

      return dir * String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' });
    });
  }

  function gradeClass(g) {
    if (g === null || g === undefined || g === '') return '';
    const n = Number(g);
    if (n < 50) return 'low';
    if (n < 75) return 'mid';
    return 'high';
  }

  function initials(name) {
    return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  /* ---------- Stats Bar ---------- */
  function updateStats(all) {
    const males   = all.filter(s => s.gender === 'Male').length;
    const females = all.filter(s => s.gender === 'Female').length;
    const grades  = all.map(s => Number(s.grade)).filter(g => !isNaN(g) && g > 0);
    const avg     = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1) : '—';
    const deps    = new Set(all.map(s => s.department)).size;

    window.animateCounter(sbTotal,  all.length, 600);
    window.animateCounter(sbMale,   males, 600);
    window.animateCounter(sbFemale, females, 600);
    window.animateCounter(sbDeps,   deps, 600);
    sbAvg.textContent = avg;
  }

  /* ---------- Table Row ---------- */
  function buildRow(student, index) {
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${index * 35}ms`;

    const grade    = student.grade !== null && student.grade !== undefined && student.grade !== '' ? student.grade : '—';
    const gradeVal = grade !== '—' ? Number(grade) : null;
    const gClass   = gradeClass(gradeVal);
    const gWidth   = gradeVal !== null ? Math.min(gradeVal, 100) : 0;

    tr.innerHTML = `
      <td>
        <div class="name-cell">
          <div class="name-avatar">${initials(student.name)}</div>
          <span>${escapeHtml(student.name)}</span>
        </div>
      </td>
      <td>${student.age}</td>
      <td>
        <span class="gender-badge ${(student.gender || '').toLowerCase()}">
          ${escapeHtml(student.gender || '—')}
        </span>
      </td>
      <td>
        <span class="dep-badge">${escapeHtml(student.department || '—')}</span>
      </td>
      <td>
        <div class="grade-cell">
          <span>${grade}</span>
          ${gradeVal !== null ? `
            <div class="grade-bar">
              <div class="grade-fill ${gClass}" style="width:${gWidth}%"></div>
            </div>` : ''}
        </div>
      </td>
      <td>
        <button class="btn btn-danger" data-id="${student.id}" aria-label="Remove ${escapeHtml(student.name)}">
          Remove
        </button>
      </td>
    `;

    tr.querySelector('.btn-danger').addEventListener('click', () => openDeleteModal(student));
    return tr;
  }

  /* ---------- Mobile Card ---------- */
  function buildCard(student, index) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.style.animationDelay = `${index * 35}ms`;

    const grade = student.grade !== null && student.grade !== undefined && student.grade !== '' ? student.grade : '—';

    card.innerHTML = `
      <div class="student-card-top">
        <div class="name-avatar">${initials(student.name)}</div>
        <div class="student-card-info">
          <div class="student-card-name">${escapeHtml(student.name)}</div>
          <div class="student-card-age">Age ${student.age}</div>
        </div>
      </div>
      <div class="student-card-meta">
        <span class="dep-badge">${escapeHtml(student.department || '—')}</span>
        <span class="gender-badge ${(student.gender || '').toLowerCase()}">
          ${escapeHtml(student.gender || '—')}
        </span>
      </div>
      <div class="student-card-footer" style="margin-top:var(--space-4)">
        <span class="student-card-grade">Grade: ${grade}</span>
        <button class="btn btn-danger" data-id="${student.id}" aria-label="Remove ${escapeHtml(student.name)}">
          Remove
        </button>
      </div>
    `;

    card.querySelector('.btn-danger').addEventListener('click', () => openDeleteModal(student));
    return card;
  }

  /* ---------- Render ---------- */
  function render() {
    const filtered = getSorted(getFiltered());
    const all      = window.SchoolaStorage.load();

    updateStats(all);

    // Results count
    resultsCount.textContent =
      filtered.length === 1
        ? '1 student'
        : `${filtered.length} student${filtered.length !== 1 ? 's' : ''}`;

    // Empty state
    const isEmpty = filtered.length === 0;
    emptyState.hidden = !isEmpty;

    if (isEmpty) {
      const hasFilters = searchInput?.value || depFilter?.value !== 'All' || genderFilter?.value !== 'All';
      emptyTitle.textContent = hasFilters ? 'No results found' : 'No students yet';
      emptyMsg.textContent   = hasFilters
        ? 'No students match your current filters. Try adjusting your search.'
        : 'Start by adding your first student to the academy.';
    }

    // Table (desktop)
    if (tableBody) {
      tableBody.innerHTML = '';
      const fragment = document.createDocumentFragment();
      filtered.forEach((s, i) => fragment.appendChild(buildRow(s, i)));
      tableBody.appendChild(fragment);
    }

    // Cards (mobile)
    if (cardList) {
      cardList.innerHTML = '';
      const fragment = document.createDocumentFragment();
      filtered.forEach((s, i) => fragment.appendChild(buildCard(s, i)));
      cardList.appendChild(fragment);
    }

    // Update sort header indicators
    document.querySelectorAll('.th-sortable').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
      if (th.dataset.col === sortCol) {
        th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
      }
    });
  }

  /* ---------- Header Sort Click ---------- */
  document.querySelectorAll('.th-sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortCol = col;
        sortDirection = 'asc';
      }
      // Sync the sort dropdown
      if (sortSelect) sortSelect.value = col;
      render();
    });
  });

  /* ---------- Control Events ---------- */
  searchInput?.addEventListener('input', () => {
    searchClear?.classList.toggle('visible', searchInput.value.length > 0);
    render();
  });

  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    searchInput.focus();
    render();
  });

  depFilter?.addEventListener('change', render);
  genderFilter?.addEventListener('change', render);

  sortSelect?.addEventListener('change', () => {
    sortCol = sortSelect.value;
    sortDirection = 'asc';
    render();
  });

  clearFiltersBtn?.addEventListener('click', () => {
    searchInput.value    = '';
    depFilter.value      = 'All';
    genderFilter.value   = 'All';
    sortSelect.value     = 'name';
    sortCol              = 'name';
    sortDirection        = 'asc';
    searchClear?.classList.remove('visible');
    render();
  });

  /* ---------- CSV Export ---------- */
  exportBtn?.addEventListener('click', () => {
    const students = getSorted(getFiltered());
    if (!students.length) return;

    const headers = ['Name', 'Age', 'Gender', 'Department', 'Grade'];
    const rows    = students.map(s => [
      `"${(s.name || '').replace(/"/g, '""')}"`,
      s.age,
      s.gender,
      s.department,
      s.grade !== null && s.grade !== undefined ? s.grade : '',
    ]);

    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `schoola-students-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });

  /* ---------- Delete Modal ---------- */
  function openDeleteModal(student) {
    pendingDeleteId = student.id;
    deleteStudentName.textContent = student.name;
    deleteModal.hidden = false;
    document.body.style.overflow = 'hidden';
    confirmDeleteBtn.focus();
  }

  function closeDeleteModal() {
    deleteModal.hidden = true;
    document.body.style.overflow = '';
    pendingDeleteId = null;
  }

  cancelDeleteBtn?.addEventListener('click', closeDeleteModal);

  deleteModal?.addEventListener('click', e => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !deleteModal.hidden) closeDeleteModal();
  });

  confirmDeleteBtn?.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    window.SchoolaStorage.remove(pendingDeleteId);
    closeDeleteModal();
    render();
  });

  /* ---------- XSS Guard ---------- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /* ---------- Init ---------- */
  render();
});
