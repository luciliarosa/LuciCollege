/* ══════════════════════════════════════════
   LUCI COLLEGE — theme.js
   Alternância de tema claro / escuro
   ══════════════════════════════════════════ */

"use strict";

/**
 * Aplica o tema salvo no localStorage assim que o script carrega.
 * Chamado imediatamente para evitar flash de tema errado.
 */
function initTheme() {
  const saved = localStorage.getItem("luci_theme") || "dark";
  applyTheme(saved);
}

/**
 * Aplica o tema informado e persiste no localStorage.
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);
  localStorage.setItem("luci_theme", theme);
  _updateThemeButtons(isLight);
}

/**
 * Alterna entre tema claro e escuro.
 * Exposto globalmente — chamado pelo onclick dos botões.
 */
function toggleTheme() {
  const isLight = document.body.classList.contains("light-theme");
  applyTheme(isLight ? "dark" : "light");
}

/**
 * Atualiza os rótulos de todos os botões de tema presentes na página.
 * @param {boolean} isLight
 */
function _updateThemeButtons(isLight) {
  const labelText = isLight ? "Modo Escuro" : "Modo Claro";

  const publicLabel = document.getElementById("public-theme-label");
  if (publicLabel) publicLabel.textContent = labelText;

  const headerLabel = document.getElementById("header-theme-label");
  if (headerLabel) headerLabel.textContent = labelText;

  const loginLabel = document.getElementById("login-theme-label");
  if (loginLabel) loginLabel.textContent = labelText;
}

// Inicializa imediatamente e também no DOMContentLoaded (segurança)
initTheme();
document.addEventListener("DOMContentLoaded", initTheme);
