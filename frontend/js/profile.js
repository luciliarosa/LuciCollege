/* ══════════════════════════════════════════
   LUCI COLLEGE — profile.js
   Perfil do aluno: dados, timeline de atividades
   ══════════════════════════════════════════ */

"use strict";

let activeAtivType = "todos";

/* ─── CONSTANTES DE EXIBIÇÃO ─── */
const ATIV_ICON = {
  presenca:  "📅",
  prova:     "📝",
  trabalho:  "📌",
  evento:    "🎪",
  indicacao: "👥",
};

const ATIV_LABEL = {
  presenca:  "Presença",
  prova:     "Avaliação",
  trabalho:  "Trabalho",
  evento:    "Evento",
  indicacao: "Indicação",
};

const MESES_FULL = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

/* ──────────────────────────────────────────
   RENDERIZAÇÃO DO PERFIL
   ────────────────────────────────────────── */

/** Renderiza todas as informações do perfil do aluno logado. */
function renderPerfil() {
  if (!currentUser) return;

  const nomes    = currentUser.nome.split(" ");
  const iniciais = ((nomes[0]?.[0] || "") + (nomes[1]?.[0] || "")).toUpperCase();

  setEl("perfil-avatar-iniciais", iniciais);
  setEl("perfil-nivel-badge",     getLevel(currentUser.pontos_disponiveis));

  const tituloEl = document.getElementById("perfil-nome-titulo");
  if (tituloEl) tituloEl.innerHTML = `${nomes[0]}<br/><em>${nomes.slice(1).join(" ")}</em>`;

  setEl("perfil-curso",      currentUser.curso     || "—");
  setEl("perfil-matricula",  currentUser.matricula  || "—");
  setEl("perfil-email",      currentUser.email      || `${currentUser.matricula?.toLowerCase()}@luci.edu.br`);
  setEl("perfil-pts-disp",   formatNum(currentUser.pontos_disponiveis));
  setEl("perfil-pts-total",  formatNum(currentUser.pontos_disponiveis + currentUser.pontos_resgatados));
  setEl("perfil-resgates",   currentUser.resgates_total);

  const myIdx = allRanking.findIndex(r => r.me);
  setEl("perfil-pos-ranking", myIdx >= 0 ? `#${myIdx + 1}º` : "—");

  renderAtividades();
}

/* ──────────────────────────────────────────
   FILTRO DE TIPO DE ATIVIDADE
   ────────────────────────────────────────── */

/**
 * Define o filtro de tipo de atividade e re-renderiza.
 * @param {HTMLElement} el - Botão de filtro clicado
 */
function setAtivType(el) {
  document.querySelectorAll(".filter-tab[data-atype]").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  activeAtivType = el.dataset.atype;
  renderAtividades();
}

/* ──────────────────────────────────────────
   TIMELINE DE ATIVIDADES
   ────────────────────────────────────────── */

/** Renderiza o resumo semestral e a timeline de atividades filtradas. */
function renderAtividades() {
  const semestre = document.getElementById("perfil-semestre-sel")?.value || "2026-1";
  const tipo     = activeAtivType;
  const todas    = DEMO_ATIVIDADES[semestre] || [];
  const filtradas = todas.filter(a => tipo === "todos" || a.status === tipo);

  // ── Resumo do semestre ──
  const totalGanhou    = todas.filter(a => a.status === "ganhou").length;
  const totalNaoGanhou = todas.filter(a => a.status === "nao_ganhou").length;
  const ptsGanhos      = todas.filter(a => a.status === "ganhou").reduce((s, a) => s + a.pontos, 0);
  const total          = totalGanhou + totalNaoGanhou;

  const resumoEl = document.getElementById("perfil-semestre-resumo");
  if (resumoEl) {
    resumoEl.innerHTML = `
      <div class="psr-card">
        <span class="psr-icon"></span>
        <div class="psr-info">
          <span class="psr-num green">+${formatNum(ptsGanhos)}</span>
          <span class="psr-label">Pontos no semestre</span>
        </div>
      </div>
      <div class="psr-card">
        <span class="psr-icon"></span>
        <div class="psr-info">
          <span class="psr-num green">${totalGanhou}</span>
          <span class="psr-label">Atividades com pontos</span>
        </div>
      </div>
      <div class="psr-card">
        <span class="psr-icon"></span>
        <div class="psr-info">
          <span class="psr-num red">${totalNaoGanhou}</span>
          <span class="psr-label">Atividades sem pontos</span>
        </div>
      </div>
      <div class="psr-card">
        <span class="psr-icon"></span>
        <div class="psr-info">
          <span class="psr-num">${total > 0 ? Math.round((totalGanhou / total) * 100) : 0}%</span>
          <span class="psr-label">Taxa de aproveitamento</span>
        </div>
      </div>`;
  }

  // ── Timeline agrupada por mês ──
  const timelineEl = document.getElementById("perfil-timeline");
  if (!timelineEl) return;

  if (!filtradas.length) {
    timelineEl.innerHTML = `<p class="perfil-empty">Nenhuma atividade encontrada para este filtro.</p>`;
    return;
  }

  // Agrupa por mês
  const porMes = new Map();
  filtradas.forEach(a => {
    const [, mes, ano] = a.data.split("/");
    const key = `${ano}-${mes}`;
    if (!porMes.has(key)) porMes.set(key, []);
    porMes.get(key).push(a);
  });

  const mesesOrdenados = [...porMes.keys()].sort((a, b) => b.localeCompare(a));

  timelineEl.innerHTML = mesesOrdenados.map(key => {
    const [ano, mes]  = key.split("-");
    const mesIdx      = parseInt(mes, 10) - 1;
    const ativs       = porMes.get(key);
    const ptsMes      = ativs.filter(a => a.status === "ganhou").reduce((s, a) => s + a.pontos, 0);
    const badgeClass  = ptsMes > 0 ? "ganhou" : "zero";
    const badgeText   = ptsMes > 0 ? `+${formatNum(ptsMes)} pts` : "0 pts";

    const cards = ativs.map(a => `
      <div class="ativ-card ${a.status}">
        <div class="ativ-icon ${a.status}">${ATIV_ICON[a.tipo] || "📋"}</div>
        <div class="ativ-body">
          <span class="ativ-nome">${a.descricao}</span>
          <div class="ativ-detalhe">
            <span class="motivo-pill">${ATIV_LABEL[a.tipo] || a.tipo}</span>
            <span>${a.detalhe}</span>
            ${a.status === "nao_ganhou" && a.motivo_nao ? `<span style="color:#f87171">⚠ ${a.motivo_nao}</span>` : ""}
          </div>
        </div>
        <div class="ativ-pts-col">
          <span class="ativ-pts ${a.status}">${a.status === "ganhou" ? "+" + formatNum(a.pontos) : "—"}</span>
          <span class="ativ-pts-label">${a.status === "ganhou" ? "pontos" : "pts"}</span>
          <span class="ativ-data">${a.data}</span>
        </div>
      </div>`).join("");

    return `
      <div class="mes-group">
        <div class="mes-header">
          <span class="mes-label">${MESES_FULL[mesIdx]} ${ano}</span>
          <span class="mes-pts-badge ${badgeClass}">${badgeText}</span>
          <div class="mes-line"></div>
        </div>
        <div class="ativ-list">${cards}</div>
      </div>`;
  }).join("");
}
