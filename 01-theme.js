// ============================================================
// 01-THEME.js — Dark/Light Toggle
// ============================================================

const STORAGE_THEME = 'pulse_theme_v1';

function initTheme() {
  const saved = localStorage.getItem(STORAGE_THEME);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;
  if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
  updateThemeIcon(isDark);
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem(STORAGE_THEME, 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem(STORAGE_THEME, 'dark');
  }
  updateThemeIcon(!isDark);
}

function updateThemeIcon(isDark) {
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.textContent = isDark ? '🌙' : '☀️';
    btn.classList.toggle('active', isDark);
  }
}
