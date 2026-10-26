/* ══════════════════════════════════════════
   LUCI COLLEGE — ranking.js
   Ranking de alunos: pódio, banner e lista
   ══════════════════════════════════════════ */

"use strict";

let allRanking       = [];
let activeRankCurso  = "todos";

/* ──────────────────────────────────────────
   CARREGAMENTO
   ────────────────────────────────────────── */

/** Carrega o ranking da API ou usa dados demo. */
async function loadRanking() {
  const data = await API.get("/ranking");
  allRanking = (data && data.ranking) ? data.ranking : DEMO_RANKING;
  renderPodium(allRanking);
  renderMyBanner(allRanking);
  renderRanking(allRanking);
}

/* ──────────────────────────────────────────
   RENDERIZAÇÃO
   ────────────────────────────────────────── */

/**
 * Preenche o pódio com os 3 primeiros colocados.
 * @param {Array} list
 */
function renderPodium(list) {
  const top3 = list.slice(0, 3);
  // Ordem visual: 2º | 1º | 3º
  [[1, 2], [0, 1], [2, 3]].forEach(([dataIdx, n]) => {
    const p = top3[dataIdx];
    if (!p) return;
    setEl(`pod-av-${n}`, p.iniciais);
    setEl(`pod-nm-${n}`, p.nome.split(" ")[0]);
    setEl(`pod-pt-${n}`, formatNum(p.pontos) + " pts");
  });
}

/**
 * Exibe o banner com a posição e pontuação do aluno logado.
 * @param {Array} list
 */
function renderMyBanner(list) {
  const myIdx = list.findIndex(r => r.me);
  if (myIdx < 0) return;
  const me   = list[myIdx];
  const pos  = myIdx + 1;
  const prev = myIdx > 0 ? list[myIdx - 1] : null;
  setEl("my-rank-pos",  `#${pos}º lugar`);
  setEl("my-rank-pts",  formatNum(me.pontos));
  setEl("my-rank-diff", prev
    ? `Faltam ${formatNum(prev.pontos - me.pontos)} pts para o #${pos - 1}º lugar`
    : "🏆 Você está em 1º lugar!"
  );
}

/**
 * Renderiza a lista completa do ranking com filtros.
 * @param {Array} list
 */
function renderRanking(list) {
  const q        = (document.getElementById("rank-search")?.value || "").toLowerCase();
  const curso    = activeRankCurso;
  const filtered = list.filter(r =>
    (curso === "todos" || r.curso === curso) &&
    r.nome.toLowerCase().includes(q)
  );
  const maxPts = filtered.length ? filtered[0].pontos : 1;
  const el     = document.getElementById("ranking-list");

  if (!filtered.length) {
    el.innerHTML = `<p style="color:var(--text3);padding:40px 0;text-align:center">Nenhum aluno encontrado.</p>`;
    return;
  }

  el.innerHTML = filtered.map((r, i) => {
    const pos      = list.indexOf(r) + 1;
    const posClass = pos === 1 ? "gold" : pos === 2 ? "silver" : pos === 3 ? "bronze" : "";
    const posStr   = pos <= 3 ? ["🥇", "🥈", "🥉"][pos - 1] : `#${pos}`;
    const barPct   = Math.round((r.pontos / maxPts) * 100);
    return `
      <div class="ranking-item ${r.me ? "me" : ""}" style="animation-delay:${i * 0.04}s">
        <span class="rank-pos ${posClass}">${posStr}</span>
        <div class="rank-avatar">${r.iniciais}</div>
        <div class="rank-info">
          <div class="rank-name">
            ${r.nome}
            ${r.me ? '<span class="rank-me-tag">VOCÊ</span>' : ""}
          </div>
          <div class="rank-course">${r.curso}</div>
        </div>
        <div class="rank-right">
          <span class="rank-pts">${formatNum(r.pontos)}</span>
          <div class="rank-bar-wrap"><div class="rank-bar-fill" style="width:${barPct}%"></div></div>
        </div>
      </div>`;
  }).join("");
}

/* ──────────────────────────────────────────
   FILTROS
   ────────────────────────────────────────── */

/**
 * Define o filtro de curso ativo e re-renderiza.
 * @param {HTMLElement} el - Botão de filtro clicado
 */
function setRankCurso(el) {
  document.querySelectorAll(".filter-tab[data-rcurso]").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  activeRankCurso = el.dataset.rcurso;
  renderRanking(allRanking);
}

/** Re-renderiza com base no campo de busca. */
function filterRanking() {
  renderRanking(allRanking);
}
