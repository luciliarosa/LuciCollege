/* ══════════════════════════════════════════
   LUCI COLLEGE — history.js
   Histórico de resgates do aluno
   ══════════════════════════════════════════ */

"use strict";

let allHistory       = [];
let activeHistStatus = "todos";

/* ──────────────────────────────────────────
   CARREGAMENTO
   ────────────────────────────────────────── */

/** Carrega o histórico de resgates da API ou usa dados demo. */
async function loadHistory() {
  const data = await API.get(`/historico/${currentUser.id}`);
  allHistory = (data && data.historico) ? data.historico : DEMO_HISTORY;
  renderHistory(allHistory);
  updateHistStats();
}

/* ──────────────────────────────────────────
   RENDERIZAÇÃO
   ────────────────────────────────────────── */

/**
 * Renderiza a tabela de histórico com filtro de status e busca por texto.
 * @param {Array} list
 */
function renderHistory(list) {
  const q        = (document.getElementById("hist-search")?.value || "").toLowerCase();
  const filtered = list.filter(h =>
    (activeHistStatus === "todos" || h.status === activeHistStatus) &&
    h.premio.toLowerCase().includes(q)
  );
  const tbody = document.getElementById("history-body");

  if (!filtered.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5" style="text-align:center;color:var(--text3);padding:60px">Nenhum resgate encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(h => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--text3);white-space:nowrap">${h.data}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          ${h.imagem
            ? `<img src="${h.imagem}" alt="${h.premio}" style="width:28px;height:28px;object-fit:cover;border-radius:4px;">`
            : `<span style="font-size:20px">${h.emoji || "🎁"}</span>`
          }
          <span style="font-weight:500;color:var(--text)">${h.premio}</span>
        </div>
      </td>
      <td><span class="cat-pill">${catLabel(h.categoria || "outro")}</span></td>
      <td style="font-family:var(--font-head);font-weight:700;color:var(--accent3)">${formatNum(h.pontos)}</td>
      <td><span class="status-badge ${h.status}">${statusLabel(h.status)}</span></td>
    </tr>`).join("");
}

/** Atualiza os contadores estatísticos da seção de histórico. */
function updateHistStats() {
  setEl("hist-total-resgates", allHistory.length);
  setEl("hist-total-pts",      formatNum(allHistory.reduce((s, h) => s + (h.pontos || 0), 0)));
  setEl("hist-aprovados",      allHistory.filter(h => h.status === "aprovado" || h.status === "entregue").length);
  setEl("hist-pendentes",      allHistory.filter(h => h.status === "pendente").length);
}

/* ──────────────────────────────────────────
   FILTROS
   ────────────────────────────────────────── */

/**
 * Define o filtro de status ativo e re-renderiza.
 * @param {HTMLElement} el - Botão de filtro clicado
 */
function setHistStatus(el) {
  document.querySelectorAll(".filter-tab[data-hstatus]").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  activeHistStatus = el.dataset.hstatus;
  renderHistory(allHistory);
}

/** Re-renderiza com base no campo de busca. */
function filterHistory() {
  renderHistory(allHistory);
}
