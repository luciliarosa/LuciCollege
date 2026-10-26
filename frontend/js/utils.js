/* ══════════════════════════════════════════
   LUCI COLLEGE — utils.js
   Funções utilitárias globais reutilizáveis
   ══════════════════════════════════════════ */

"use strict";

/**
 * Formata um número para o padrão pt-BR (ex: 3850 → "3.850")
 * @param {number} n
 * @returns {string}
 */
function formatNum(n) {
  return Number(n).toLocaleString("pt-BR");
}

/**
 * Promessa que aguarda `ms` milissegundos
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Define o textContent de um elemento pelo ID (sem lançar erro se não existir)
 * @param {string} id
 * @param {string|number} val
 */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/**
 * Exibe um toast de notificação temporária
 * @param {string} msg
 * @param {number} [duration=3500]
 */
function showToast(msg, duration = 3500) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add("hidden"), duration);
}

/**
 * Retorna o rótulo legível de uma categoria de prêmio
 * @param {string} cat
 * @returns {string}
 */
function catLabel(cat) {
  return { mochila: "Mochila", papelaria: "Papelaria", servico: "Serviço", acessorio: "Acessório" }[cat] || cat;
}

/**
 * Retorna o rótulo legível de um status de resgate
 * @param {string} s
 * @returns {string}
 */
function statusLabel(s) {
  return { aprovado: "Aprovado", pendente: "Pendente", cancelado: "Cancelado", entregue: "Entregue" }[s] || s;
}

/**
 * Retorna o nível do aluno com base nos pontos disponíveis
 * @param {number} pts
 * @returns {string}
 */
function getLevel(pts) {
  if (pts >= 5000) return "Nível Platinum ✦";
  if (pts >= 3000) return "Nível Ouro ★";
  if (pts >= 1500) return "Nível Prata";
  return "Nível Iniciante";
}
