/* ══════════════════════════════════════════
   LUCI COLLEGE — staff.js
   Portal do Professor e Admin:
   notas, presenças, trabalhos, concessão de pontos
   ══════════════════════════════════════════ */

"use strict";

// ─── Estado do painel staff ───
let currentStaffUser       = null;
let currentSubjectId       = null;
let currentAdminTab        = "notas";
let currentGrantAmount     = 200;
let selectedStudentMatricula = null;
let selectedHistoryFilter  = "todos";

/* ──────────────────────────────────────────
   INICIALIZAÇÃO DO PAINEL STAFF
   ────────────────────────────────────────── */

/**
 * Inicializa e exibe o painel de professor ou admin.
 * @param {"professor"|"admin"} role
 */
function enterStaffApp(role) {
  const publicNav = document.getElementById("public-navbar");
  if (publicNav) publicNav.classList.add("hidden");
  document.getElementById("login-overlay").classList.remove("active");
  document.getElementById("login-overlay").classList.add("hidden");
  document.getElementById("app").classList.add("hidden");
  document.getElementById("admin-app").classList.remove("hidden");

  const badgeEl    = document.getElementById("staff-role-badge");
  const nameEl     = document.getElementById("staff-name");
  const deptEl     = document.getElementById("staff-dept");
  const avatarEl   = document.getElementById("staff-avatar");
  const visaoTabBtn = document.getElementById("admin-tab-btn-visao");

  if (role === "professor") {
    badgeEl.innerHTML  = "👨‍🏫 Portal do Professor";
    badgeEl.className  = "staff-role-badge professor";
    if (visaoTabBtn) visaoTabBtn.classList.add("hidden");
  } else {
    badgeEl.innerHTML  = "🛡️ Coordenação & Admin";
    badgeEl.className  = "staff-role-badge admin";
    if (visaoTabBtn) visaoTabBtn.classList.remove("hidden");
  }

  nameEl.textContent   = currentStaffUser.nome;
  deptEl.textContent   = currentStaffUser.departamento;
  avatarEl.textContent = currentStaffUser.nome.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("");

  setupSubjectSelector(role);
  switchAdminTab("notas");
}

/* ──────────────────────────────────────────
   SELETOR DE DISCIPLINA
   ────────────────────────────────────────── */

/**
 * Popula o seletor de disciplinas conforme o papel do usuário.
 * Professores: apenas suas disciplinas. Admin: todas.
 * @param {"professor"|"admin"} role
 */
function setupSubjectSelector(role) {
  const select = document.getElementById("subject-select");
  const notice = document.getElementById("scope-notice");
  if (!select) return;
  select.innerHTML = "";

  if (role === "professor") {
    const allowed = currentStaffUser.materias;
    allowed.forEach(subId => {
      const sub = DEMO_SUBJECTS[subId];
      if (sub) {
        const opt = document.createElement("option");
        opt.value       = sub.id;
        opt.textContent = `${sub.nome} (${sub.id}) — ${sub.alunos.length} alunos`;
        select.appendChild(opt);
      }
    });
    currentSubjectId = allowed[0];
    notice.innerHTML = `
      <span class="scope-notice-tag doc">🔒 Acesso Restrito Docente</span>
      <span>Você visualiza <strong>exclusivamente as suas ${allowed.length} disciplinas</strong> e os respectivos alunos matriculados.</span>`;
  } else {
    const allOpt        = document.createElement("option");
    allOpt.value        = "todos";
    allOpt.textContent  = "🌐 Todas as Disciplinas (Visão Geral do Campus)";
    select.appendChild(allOpt);

    Object.values(DEMO_SUBJECTS).forEach(sub => {
      const opt       = document.createElement("option");
      opt.value       = sub.id;
      opt.textContent = `${sub.nome} (${sub.id}) — ${sub.professorNome}`;
      select.appendChild(opt);
    });

    currentSubjectId = "todos";
    notice.innerHTML = `
      <span class="scope-notice-tag adm">🛡️ Acesso Geral de Administrador</span>
      <span>Permissão global para visualizar e gerenciar <strong>todas as matérias, notas e presenças</strong> do campus.</span>`;
  }

  select.value = currentSubjectId;
}

/** Atualiza a disciplina ativa e re-renderiza a aba corrente. */
function onSubjectChange(val) {
  currentSubjectId = val;
  renderCurrentTab();
}

/* ──────────────────────────────────────────
   CONTROLE DE ABAS
   ────────────────────────────────────────── */

/**
 * Troca a aba ativa do painel staff.
 * @param {"notas"|"presencas"|"trabalhos"|"pontos"|"visao"} tabName
 */
function switchAdminTab(tabName) {
  currentAdminTab = tabName;
  document.querySelectorAll(".staff-nav .nav-link").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.adminTab === tabName);
  });
  document.querySelectorAll(".staff-pane").forEach(pane => {
    pane.classList.toggle("hidden",  pane.id !== "pane-" + tabName);
    pane.classList.toggle("active",  pane.id === "pane-" + tabName);
  });
  renderCurrentTab();
}

/** Renderiza o conteúdo da aba atualmente ativa. */
function renderCurrentTab() {
  if (currentAdminTab === "notas")     renderNotas();
  else if (currentAdminTab === "presencas") renderPresencas();
  else if (currentAdminTab === "trabalhos") renderTrabalhos();
  else if (currentAdminTab === "pontos")    renderPontos();
  else if (currentAdminTab === "visao")     renderAdminVisao();
}

/**
 * Retorna as disciplinas ativas com base no papel e seleção atual.
 * @returns {Array}
 */
function getActiveSubjects() {
  if (!currentStaffUser) return [];
  if (currentStaffUser.role === "professor") {
    if (currentSubjectId && currentStaffUser.materias.includes(currentSubjectId)) {
      return [DEMO_SUBJECTS[currentSubjectId]];
    }
    return [DEMO_SUBJECTS[currentStaffUser.materias[0]]];
  } else {
    if (currentSubjectId === "todos") return Object.values(DEMO_SUBJECTS);
    return DEMO_SUBJECTS[currentSubjectId] ? [DEMO_SUBJECTS[currentSubjectId]] : Object.values(DEMO_SUBJECTS);
  }
}

/* ──────────────────────────────────────────
   ABA 1: NOTAS
   ────────────────────────────────────────── */

/** Renderiza a tabela de notas para as disciplinas ativas. */
function renderNotas() {
  const tbody   = document.getElementById("tbody-notas");
  const statsEl = document.getElementById("notas-stats");
  if (!tbody) return;
  tbody.innerHTML = "";

  const subjects    = getActiveSubjects();
  let totalAlunos   = 0;
  let somaMedias    = 0;
  let aprovados     = 0;

  subjects.forEach(sub => {
    sub.alunos.forEach(aluno => {
      totalAlunos++;
      const p1   = Number(aluno.p1)   || 0;
      const p2   = Number(aluno.p2)   || 0;
      const trab = Number(aluno.trab) || 0;
      const media = Number((p1 * 0.35 + p2 * 0.35 + trab * 0.30).toFixed(1));
      somaMedias += media;

      let sitClass = "aprovado";
      let sitLabel = "Aprovado";
      if (media >= 7.0)      { aprovados++; sitClass = "aprovado"; sitLabel = "Aprovado"; }
      else if (media >= 5.0) { sitClass = "pendente";  sitLabel = "Recuperação"; }
      else                   { sitClass = "cancelado"; sitLabel = "Reprovado"; }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${aluno.nome}</strong></td>
        <td><code>${aluno.matricula}</code></td>
        <td><span class="cat-pill">${aluno.curso}</span></td>
        <td><span class="subject-tag">${sub.nome}</span></td>
        <td><input type="number" step="0.1" min="0" max="10" class="grade-input" id="p1_${sub.id}_${aluno.matricula}" value="${p1}"></td>
        <td><input type="number" step="0.1" min="0" max="10" class="grade-input" id="p2_${sub.id}_${aluno.matricula}" value="${p2}"></td>
        <td><input type="number" step="0.1" min="0" max="10" class="grade-input" id="trab_${sub.id}_${aluno.matricula}" value="${trab}"></td>
        <td><strong class="grade-media ${sitClass}">${media.toFixed(1)}</strong></td>
        <td><span class="status-badge ${sitClass}">${sitLabel}</span></td>
        <td><button class="btn-table-action" onclick="saveGrade('${sub.id}', '${aluno.matricula}')">Salvar</button></td>`;
      tbody.appendChild(tr);
    });
  });

  const mediaGeral = totalAlunos > 0 ? (somaMedias / totalAlunos).toFixed(1) : "0.0";
  const taxaAprov  = totalAlunos > 0 ? Math.round((aprovados / totalAlunos) * 100) : 0;
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-pill"><span>Total Alunos:</span> <strong>${totalAlunos}</strong></div>
      <div class="stat-pill"><span>Média da Turma:</span> <strong>${mediaGeral}</strong></div>
      <div class="stat-pill"><span>Aprovação:</span> <strong style="color:var(--green)">${taxaAprov}%</strong></div>`;
  }
}

/**
 * Salva a nota editada de um aluno e re-renderiza.
 * @param {string} subId
 * @param {string} matricula
 */
function saveGrade(subId, matricula) {
  const p1Val   = parseFloat(document.getElementById(`p1_${subId}_${matricula}`).value)   || 0;
  const p2Val   = parseFloat(document.getElementById(`p2_${subId}_${matricula}`).value)   || 0;
  const trabVal = parseFloat(document.getElementById(`trab_${subId}_${matricula}`).value) || 0;

  const sub   = DEMO_SUBJECTS[subId];
  if (!sub) return;
  const aluno = sub.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;

  aluno.p1   = Math.min(10, Math.max(0, p1Val));
  aluno.p2   = Math.min(10, Math.max(0, p2Val));
  aluno.trab = Math.min(10, Math.max(0, trabVal));

  renderNotas();
  showToast(`✅ Notas de ${aluno.nome.split(" ")[0]} atualizadas com sucesso!`);
}

/* ──────────────────────────────────────────
   ABA 2: PRESENÇAS
   ────────────────────────────────────────── */

/** Renderiza a tabela de frequência para as disciplinas ativas. */
function renderPresencas() {
  const tbody   = document.getElementById("tbody-presencas");
  const statsEl = document.getElementById("presencas-stats");
  if (!tbody) return;
  tbody.innerHTML = "";

  const subjects  = getActiveSubjects();
  let totalAlunos = 0;
  let somaFreq    = 0;
  let emRisco     = 0;

  subjects.forEach(sub => {
    sub.alunos.forEach(aluno => {
      totalAlunos++;
      const pct     = Math.min(100, Math.round((aluno.presencas / sub.totalAulas) * 100));
      somaFreq     += pct;
      const regular = pct >= 75;
      if (!regular) emRisco++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${aluno.nome}</strong></td>
        <td><code>${aluno.matricula}</code></td>
        <td><span class="subject-tag">${sub.nome}</span></td>
        <td>${sub.totalAulas}</td>
        <td><strong style="color:var(--green)">${aluno.presencas}</strong></td>
        <td><strong style="color:var(--red)">${aluno.faltas}</strong></td>
        <td>
          <div class="freq-wrap">
            <div class="freq-bar-bg">
              <div class="freq-bar-fill ${regular ? "ok" : "danger"}" style="width:${pct}%"></div>
            </div>
            <span class="freq-label">${pct}%</span>
          </div>
        </td>
        <td>
          <span class="status-badge ${regular ? "aprovado" : "cancelado"}">
            ${regular ? "Frequente" : "Risco de Falta"}
          </span>
        </td>
        <td>
          <div class="action-buttons-group">
            <button class="btn-mini ok"     onclick="changePresenca('${sub.id}','${aluno.matricula}', true)"  title="Adicionar presença">+ Presença</button>
            <button class="btn-mini danger" onclick="changePresenca('${sub.id}','${aluno.matricula}', false)" title="Registrar falta">+ Falta</button>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });
  });

  const freqMedia = totalAlunos > 0 ? Math.round(somaFreq / totalAlunos) : 0;
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-pill"><span>Frequência Média:</span> <strong>${freqMedia}%</strong></div>
      <div class="stat-pill"><span>Em Risco (< 75%):</span> <strong style="color:${emRisco > 0 ? "var(--red)" : "var(--green)"}">${emRisco}</strong></div>`;
  }
}

/**
 * Adiciona uma presença ou falta a um aluno e re-renderiza.
 * @param {string} subId
 * @param {string} matricula
 * @param {boolean} isPresenca
 */
function changePresenca(subId, matricula, isPresenca) {
  const sub   = DEMO_SUBJECTS[subId];
  if (!sub) return;
  const aluno = sub.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;

  if (isPresenca) {
    aluno.presencas = Math.min(sub.totalAulas, aluno.presencas + 1);
    if (aluno.faltas > 0) aluno.faltas = Math.max(0, aluno.faltas - 1);
    showToast(`✅ Presença adicionada para ${aluno.nome.split(" ")[0]}`);
  } else {
    aluno.faltas    = Math.min(sub.totalAulas, aluno.faltas + 1);
    if (aluno.presencas > 0) aluno.presencas = Math.max(0, aluno.presencas - 1);
    showToast(`⚠️ Falta registrada para ${aluno.nome.split(" ")[0]}`);
  }
  renderPresencas();
}

/* ──────────────────────────────────────────
   ABA 3: TRABALHOS
   ────────────────────────────────────────── */

/** Renderiza a tabela de trabalhos com seletor de atividade. */
function renderTrabalhos() {
  const tbody        = document.getElementById("tbody-trabalhos");
  const filterSelect = document.getElementById("trabalho-select-filter");
  if (!tbody || !filterSelect) return;

  const subjects     = getActiveSubjects();
  const allTrabalhos = [];
  subjects.forEach(s => s.trabalhos.forEach(t => allTrabalhos.push({ ...t, subjectId: s.id, subjectNome: s.nome })));

  if (!allTrabalhos.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text3)">Nenhum trabalho cadastrado para esta matéria.</td></tr>`;
    return;
  }

  const prevVal = filterSelect.value;
  filterSelect.innerHTML = allTrabalhos.map(t => `<option value="${t.subjectId}_${t.id}">${t.subjectNome}: ${t.titulo} (Prazo: ${t.prazo})</option>`).join("");
  if (prevVal && [...filterSelect.options].some(o => o.value === prevVal)) filterSelect.value = prevVal;

  const [selSubId, selTrabId] = filterSelect.value.split("_");
  const sub  = DEMO_SUBJECTS[selSubId];
  if (!sub) return;
  const trab = sub.trabalhos.find(t => t.id === selTrabId);
  if (!trab) return;

  tbody.innerHTML = "";
  sub.alunos.forEach(aluno => {
    const entrega   = aluno.entregas?.[trab.id] || { status: "pendente", nota: null };
    const notaAtual = entrega.nota !== null ? entrega.nota : "";
    let badgeClass  = "pendente";
    if (entrega.status === "avaliado") badgeClass = "aprovado";
    else if (entrega.status === "entregue") badgeClass = "entregue";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${aluno.nome}</strong></td>
      <td><code>${aluno.matricula}</code></td>
      <td>${trab.titulo}</td>
      <td><span class="cat-pill">${trab.prazo}</span></td>
      <td>
        <select class="scope-select mini" id="status_${sub.id}_${trab.id}_${aluno.matricula}">
          <option value="pendente"  ${entrega.status === "pendente"  ? "selected" : ""}>⏳ Pendente</option>
          <option value="entregue"  ${entrega.status === "entregue"  ? "selected" : ""}>📬 Entregue (Aguardando Nota)</option>
          <option value="avaliado"  ${entrega.status === "avaliado"  ? "selected" : ""}>✅ Avaliado</option>
        </select>
      </td>
      <td>
        <input type="number" step="0.1" min="0" max="10" placeholder="Nota" class="grade-input" style="width:80px"
          id="nota_${sub.id}_${trab.id}_${aluno.matricula}" value="${notaAtual}">
      </td>
      <td>
        <button class="btn-table-action" onclick="saveTrabalho('${sub.id}','${trab.id}','${aluno.matricula}')">Atualizar</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

/**
 * Salva o status e nota de um trabalho e re-renderiza.
 * @param {string} subId
 * @param {string} trabId
 * @param {string} matricula
 */
function saveTrabalho(subId, trabId, matricula) {
  const statusVal = document.getElementById(`status_${subId}_${trabId}_${matricula}`).value;
  const notaVal   = parseFloat(document.getElementById(`nota_${subId}_${trabId}_${matricula}`).value);
  const sub   = DEMO_SUBJECTS[subId];
  if (!sub) return;
  const aluno = sub.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;

  if (!aluno.entregas) aluno.entregas = {};
  aluno.entregas[trabId] = {
    status: statusVal,
    nota:   isNaN(notaVal) ? null : Math.min(10, Math.max(0, notaVal)),
  };
  if (!isNaN(notaVal) && statusVal === "avaliado") aluno.trab = notaVal;

  showToast(`✅ Entrega de ${aluno.nome.split(" ")[0]} atualizada!`);
  renderTrabalhos();
}

/* ──────────────────────────────────────────
   ABA 4: CONCESSÃO DE PONTOS
   ────────────────────────────────────────── */

/** Renderiza o seletor de alunos e inicializa o histórico do primeiro. */
function renderPontos() {
  const studentSelect = document.getElementById("grant-student");
  if (!studentSelect) return;

  const subjects    = getActiveSubjects();
  const mapAlunos   = new Map();
  subjects.forEach(s => s.alunos.forEach(a => mapAlunos.set(a.matricula, a)));
  const alunosPermitidos = [...mapAlunos.values()];

  studentSelect.innerHTML = alunosPermitidos.map(a =>
    `<option value="${a.matricula}">${a.nome} (${a.matricula}) — ${a.curso}</option>`
  ).join("");

  if (!selectedStudentMatricula || !mapAlunos.has(selectedStudentMatricula)) {
    selectedStudentMatricula = alunosPermitidos[0]?.matricula || null;
  }

  if (selectedStudentMatricula) {
    studentSelect.value = selectedStudentMatricula;
    onGrantStudentSelected(selectedStudentMatricula);
  }
}

/**
 * Chamado ao selecionar um aluno no dropdown de concessão.
 * @param {string} matricula
 */
function onGrantStudentSelected(matricula) {
  selectedStudentMatricula = matricula;
  renderStudentValidationPreview(matricula);
  renderStudentPointsHistory(matricula);
}

/**
 * Renderiza o card de confirmação visual do aluno selecionado.
 * @param {string} matricula
 */
function renderStudentValidationPreview(matricula) {
  const container = document.getElementById("student-validation-card");
  if (!container) return;

  const profile = STUDENT_PROFILES[matricula];
  if (!profile) {
    container.innerHTML = `<p style="color:var(--text3);font-size:13px;padding:12px;">Selecione um aluno acima.</p>`;
    return;
  }

  const initials  = profile.nome.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("");
  const levelText = getLevel(profile.pontos_disponiveis);

  container.innerHTML = `
    <div class="svc-header">
      <div class="svc-avatar">${initials}</div>
      <div class="svc-info">
        <span class="svc-confirm-tag">✅ Aluno(a) Selecionado(a)</span>
        <h4 class="svc-name">${profile.nome}</h4>
        <span class="svc-meta">Matrícula: <strong>${profile.matricula}</strong> • ${profile.curso}</span>
        <span class="svc-submeta">${profile.email} • ${profile.semestre}</span>
      </div>
    </div>
    <div class="svc-balance-row">
      <div class="svc-balance-badge">
        <span class="svc-balance-icon">⚡</span>
        <div>
          <span class="svc-balance-pts">${formatNum(profile.pontos_disponiveis)} pts</span>
          <span class="svc-balance-label">Saldo Atual Disponível</span>
        </div>
      </div>
      <span class="svc-level-badge">${levelText}</span>
    </div>`;
}

/**
 * Define o valor rápido de pontos a conceder.
 * @param {number} amt
 */
function setGrantAmount(amt) {
  currentGrantAmount = amt;
  const inp = document.getElementById("grant-amount");
  if (inp) inp.value = amt;
  document.querySelectorAll(".btn-quick-pt").forEach(btn => {
    btn.classList.toggle("active", btn.textContent.includes(String(amt)));
  });
}

/** Executa a concessão de pontos ao aluno selecionado. */
function executeGrantPoints() {
  const studentSelect = document.getElementById("grant-student");
  const amountInput   = document.getElementById("grant-amount");
  const reasonSelect  = document.getElementById("grant-reason");
  const obsInput      = document.getElementById("grant-obs");

  const matricula = studentSelect?.value || "";
  const pontos    = parseInt(amountInput?.value || 0, 10);
  const motivo    = reasonSelect?.value || "Reconhecimento acadêmico";
  const obs       = obsInput?.value.trim() || "";

  if (!matricula || pontos <= 0) {
    alert("Selecione um aluno e informe uma quantidade válida de pontos.");
    return;
  }

  const profile = STUDENT_PROFILES[matricula];
  if (!profile) return;

  const now       = new Date();
  const todayStr  = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const fullMotivo = motivo + (obs ? ` (${obs})` : "");
  const staffName  = currentStaffUser ? currentStaffUser.nome : "Docente / Coordenação";

  profile.historico_pontos.unshift({
    data:       todayStr,
    tipo:       "credito",
    motivo:     fullMotivo,
    origem:     staffName,
    pontos:     pontos,
    saldoApos:  profile.pontos_disponiveis + pontos,
  });
  profile.pontos_disponiveis += pontos;

  // Sincroniza com o usuário logado se for o mesmo aluno
  if (matricula === "LC2024001") {
    DEMO_USER.pontos_disponiveis = profile.pontos_disponiveis;
    if (currentUser && currentUser.matricula === "LC2024001") {
      currentUser.pontos_disponiveis = profile.pontos_disponiveis;
      currentPoints = profile.pontos_disponiveis;
      if (typeof updateUI === "function") updateUI();
    }
  }

  if (obsInput) obsInput.value = "";
  renderStudentValidationPreview(matricula);
  renderStudentPointsHistory(matricula);
  showToast(`🎉 +${formatNum(pontos)} pontos concedidos com sucesso para ${profile.nome.split(" ")[0]}!`);
}

/**
 * Define o filtro do extrato de pontos do aluno.
 * @param {"todos"|"credito"|"debito"} filterType
 * @param {HTMLElement} btn
 */
function setHistoryFilter(filterType, btn) {
  selectedHistoryFilter = filterType;
  document.querySelectorAll(".grant-history-filters .filter-tab").forEach(t => t.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (selectedStudentMatricula) renderStudentPointsHistory(selectedStudentMatricula);
}

/**
 * Renderiza o extrato de pontos do aluno selecionado.
 * @param {string} matricula
 */
function renderStudentPointsHistory(matricula) {
  const titleEl   = document.getElementById("history-student-title");
  const subEl     = document.getElementById("history-student-sub");
  const summaryEl = document.getElementById("student-pts-summary");
  const listEl    = document.getElementById("grant-student-history-list");
  if (!listEl) return;

  const profile = STUDENT_PROFILES[matricula];
  if (!profile) {
    listEl.innerHTML = `<p style="color:var(--text3);font-size:13px;padding:30px;text-align:center;">Selecione um aluno para carregar o histórico de pontuação.</p>`;
    return;
  }

  if (titleEl) titleEl.textContent = `Extrato de Pontos: ${profile.nome.split(" ")[0]}`;
  if (subEl)   subEl.textContent   = `Matrícula: ${profile.matricula} • ${profile.curso}`;

  const totalCreditos = profile.historico_pontos
    .filter(h => h.tipo === "credito")
    .reduce((s, h) => s + (h.pontos > 0 ? h.pontos : 0), 0);
  const totalDebitos = Math.abs(profile.historico_pontos
    .filter(h => h.tipo === "debito")
    .reduce((s, h) => s + h.pontos, 0));

  if (summaryEl) {
    summaryEl.innerHTML = `
      <span class="pts-mini-chip cred"   title="Total de pontos já recebidos">+${formatNum(totalCreditos)} recebidos</span>
      <span class="pts-mini-chip deb"    title="Total de pontos resgatados em prêmios">-${formatNum(totalDebitos)} resgatados</span>
      <span class="pts-mini-chip total"  title="Saldo atual disponível">⚡ ${formatNum(profile.pontos_disponiveis)} pts</span>`;
  }

  const items = profile.historico_pontos.filter(h => {
    if (selectedHistoryFilter === "credito") return h.tipo === "credito";
    if (selectedHistoryFilter === "debito")  return h.tipo === "debito";
    return true;
  });

  if (!items.length) {
    listEl.innerHTML = `<p style="color:var(--text3);font-size:13px;padding:30px;text-align:center;">Nenhuma movimentação de pontos encontrada para este filtro.</p>`;
    return;
  }

  listEl.innerHTML = items.map(tx => {
    const isCred    = tx.tipo === "credito";
    const ptsText   = isCred ? `+${formatNum(tx.pontos)} pts` : `${formatNum(tx.pontos)} pts`;
    const badgeLabel = isCred ? "Crédito Recebido" : "Resgate de Prêmio";
    const badgeCls  = isCred ? "cred" : "deb";
    const icon      = isCred ? "🎁" : "🛍️";
    return `
      <div class="timeline-tx-item ${badgeCls}">
        <div class="tx-left">
          <div class="tx-badge-row">
            <span class="tx-date-badge">${tx.data}</span>
            <span class="tx-type-tag ${badgeCls}">${icon} ${badgeLabel}</span>
          </div>
          <span class="tx-motivo">${tx.motivo}</span>
          <span class="tx-origem">Concedido por / Origem: <strong>${tx.origem}</strong></span>
        </div>
        <div class="tx-right">
          <span class="tx-pts ${badgeCls}">${ptsText}</span>
        </div>
      </div>`;
  }).join("");
}

/* ──────────────────────────────────────────
   ABA 5: VISÃO GERAL (ADMIN)
   ────────────────────────────────────────── */

/** Renderiza os cards de visão geral de todas as disciplinas (exclusivo admin). */
function renderAdminVisao() {
  const container = document.getElementById("admin-subjects-cards");
  if (!container) return;
  container.innerHTML = "";

  Object.values(DEMO_SUBJECTS).forEach(sub => {
    const totalAlunos = sub.alunos.length;
    const mediaTurma  = (sub.alunos.reduce((s, a) => s + (a.p1 * 0.35 + a.p2 * 0.35 + a.trab * 0.30), 0) / totalAlunos).toFixed(1);
    const freqMedia   = Math.round(sub.alunos.reduce((s, a) => s + (a.presencas / sub.totalAulas) * 100, 0) / totalAlunos);

    const card = document.createElement("div");
    card.className = "subject-card";
    card.innerHTML = `
      <div class="sc-header">
        <div>
          <span class="sc-code">${sub.id}</span>
          <h4 class="sc-title">${sub.nome}</h4>
        </div>
        <span class="sc-semestre">${sub.semestre}</span>
      </div>
      <p class="sc-prof">👨‍🏫 Docente: <strong>${sub.professorNome}</strong></p>
      <p class="sc-curso">🎓 Curso: ${sub.curso}</p>
      <div class="sc-stats-row">
        <div><div class="sc-stat-num">${totalAlunos}</div><div class="sc-stat-label">Alunos</div></div>
        <div><div class="sc-stat-num" style="color:var(--accent)">${mediaTurma}</div><div class="sc-stat-label">Média</div></div>
        <div><div class="sc-stat-num" style="color:var(--green)">${freqMedia}%</div><div class="sc-stat-label">Frequência</div></div>
      </div>
      <button class="btn-table-action" style="margin-top:14px;width:100%" onclick="quickFilterSubject('${sub.id}')">
        Gerenciar Turma
      </button>`;
    container.appendChild(card);
  });
}

/**
 * Atalho da visão geral: filtra pela disciplina e vai para aba Notas.
 * @param {string} subId
 */
function quickFilterSubject(subId) {
  const sel = document.getElementById("subject-select");
  if (sel) {
    sel.value = subId;
    onSubjectChange(subId);
  }
  switchAdminTab("notas");
}
