/* ══════════════════════════════════════════
   LUCI COLLEGE — auth.js
   Login, logout, seleção de perfil, credenciais demo
   ══════════════════════════════════════════ */

"use strict";

// Perfil de login ativo: "aluno" | "professor" | "admin"
let currentLoginRole = "aluno";

/* ──────────────────────────────────────────
   SUBMIT DO FORMULÁRIO DE LOGIN
   ────────────────────────────────────────── */
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const matricula = document.getElementById("matricula").value.trim();
  const senha     = document.getElementById("senha").value;
  const err       = document.getElementById("login-error");
  const btnText   = document.getElementById("btn-text");
  const btnLoader = document.getElementById("btn-loader");

  err.classList.add("hidden");
  btnText.classList.add("hidden");
  btnLoader.classList.remove("hidden");
  await sleep(500);

  btnText.classList.remove("hidden");
  btnLoader.classList.add("hidden");

  if (currentLoginRole === "aluno") {
    let data = await API.post("/login", { matricula, senha });
    if (!data) {
      data = (matricula.toUpperCase() === "LC2024001" && senha === "luci123")
        ? { ok: true, user: DEMO_USER }
        : { ok: false };
    }
    if (data && data.ok) {
      currentUser   = data.user;
      currentPoints = data.user.pontos_disponiveis;
      enterApp();
    } else {
      err.textContent = "Matrícula ou senha de aluno inválidos. (Teste com LC2024001 / luci123)";
      err.classList.remove("hidden");
    }

  } else if (currentLoginRole === "professor") {
    const teacher = DEMO_TEACHERS.find(
      t => t.matricula.toUpperCase() === matricula.toUpperCase() && senha === "prof123"
    );
    if (teacher) {
      currentStaffUser = teacher;
      enterStaffApp("professor");
    } else {
      err.textContent = "Credenciais de professor inválidas. Use PROF101 ou PROF102 com a senha prof123.";
      err.classList.remove("hidden");
    }

  } else if (currentLoginRole === "admin") {
    const isAdmin =
      (matricula.toLowerCase() === "admin" || matricula.toUpperCase() === "ADMIN01") &&
      (senha === "admin123" || senha === "admin");
    if (isAdmin) {
      currentStaffUser = DEMO_ADMIN;
      enterStaffApp("admin");
    } else {
      err.textContent = "Credenciais de administrador inválidas. Use admin com a senha admin123.";
      err.classList.remove("hidden");
    }
  }
});

/* ──────────────────────────────────────────
   SELETOR DE PERFIL (ABAS DO LOGIN)
   ────────────────────────────────────────── */
/**
 * Define o perfil de login ativo e atualiza a UI do formulário.
 * @param {"aluno"|"professor"|"admin"} role
 */
function setLoginRole(role) {
  currentLoginRole = role;
  document.querySelectorAll(".role-tab").forEach(tab => {
    tab.classList.toggle("active", tab.id === "tab-role-" + role);
  });

  const titleEl  = document.getElementById("login-title");
  const subEl    = document.getElementById("login-sub");
  const labelMat = document.getElementById("label-matricula");
  const inputMat = document.getElementById("matricula");
  const inputSenha = document.getElementById("senha");
  const btnText  = document.getElementById("btn-text");
  const chipsBox = document.getElementById("demo-chips");

  inputMat.value   = "";
  inputSenha.value = "";
  document.getElementById("login-error").classList.add("hidden");

  const configs = {
    aluno: {
      title:       "Portal do<br/><em>Aluno</em>",
      sub:         "Consulte seus pontos acadêmicos e troque por prêmios.",
      label:       "Matrícula do Aluno",
      placeholder: "Ex: LC2024001",
      btnLabel:    "Entrar como Aluno",
      chips: `
        <button type="button" class="demo-chip" onclick="fillCredentials('LC2024001','luci123')">
          ⚡ Aluna Ana Luíza (LC2024001)
        </button>`,
    },
    professor: {
      title:       "Portal do<br/><em>Professor</em>",
      sub:         "Gerencie notas, presenças e trabalhos das suas disciplinas.",
      label:       "Registro Docente (Matrícula)",
      placeholder: "Ex: PROF101",
      btnLabel:    "Acessar Painel do Professor",
      chips: `
        <button type="button" class="demo-chip" onclick="fillCredentials('PROF101','prof123')">
          👨‍🏫 Prof. Roberto (Algoritmos / BD)
        </button>
        <button type="button" class="demo-chip" onclick="fillCredentials('PROF102','prof123')">
          👩‍🏫 Profa. Camila (Eng. Software / Sec)
        </button>`,
    },
    admin: {
      title:       "Portal de<br/><em>Coordenação / Admin</em>",
      sub:         "Gestão global de todos os cursos, matérias, docentes e alunos.",
      label:       "Usuário Administrador",
      placeholder: "Ex: admin ou ADMIN01",
      btnLabel:    "Acessar Painel Geral",
      chips: `
        <button type="button" class="demo-chip" onclick="fillCredentials('admin','admin123')">
          🛡️ Administrador Geral (Acesso Total)
        </button>`,
    },
  };

  const cfg = configs[role];
  if (!cfg) return;

  if (titleEl)  titleEl.innerHTML       = cfg.title;
  if (subEl)    subEl.textContent       = cfg.sub;
  if (labelMat) labelMat.textContent    = cfg.label;
  if (inputMat) inputMat.placeholder    = cfg.placeholder;
  if (btnText)  btnText.textContent     = cfg.btnLabel;
  if (chipsBox) chipsBox.innerHTML      = cfg.chips;
}

/**
 * Preenche os campos do formulário com credenciais de demonstração.
 * @param {string} user
 * @param {string} pass
 */
function fillCredentials(user, pass) {
  const matEl  = document.getElementById("matricula");
  const passEl = document.getElementById("senha");
  if (matEl)  matEl.value  = user;
  if (passEl) passEl.value = pass;
}

/** Alterna visibilidade do campo de senha. */
function togglePass() {
  const input = document.getElementById("senha");
  input.type  = input.type === "password" ? "text" : "password";
}

/* ──────────────────────────────────────────
   LOGOUT
   ────────────────────────────────────────── */
/** Desloga o aluno e retorna à tela de login. */
function logout() {
  currentUser   = null;
  currentPoints = 0;
  allProducts   = [];
  allHistory    = [];
  allRanking    = [];

  document.getElementById("app").classList.add("hidden");
  document.getElementById("admin-app").classList.add("hidden");

  const publicNav = document.getElementById("public-navbar");
  if (publicNav) publicNav.classList.remove("hidden");

  navigateTo("login");
  document.getElementById("matricula").value = "";
  document.getElementById("senha").value     = "";
  document.getElementById("login-error").classList.add("hidden");
}

/** Desloga o usuário staff (professor/admin) e retorna ao login. */
function logoutStaff() {
  currentStaffUser = null;
  logout();
}

/* ──────────────────────────────────────────
   NAVEGAÇÃO INTEGRADA (HOME / LOGIN)
   ────────────────────────────────────────── */

/**
 * Navega dinamicamente entre Home (Landing Page) e a tela de Login.
 * @param {"home"|"login"} view
 */
function navigateTo(view) {
  const landing      = document.getElementById("landing-page");
  const loginOverlay = document.getElementById("login-overlay");
  const btnPublicNav = document.getElementById("btn-public-nav");
  const app          = document.getElementById("app");
  const adminApp     = document.getElementById("admin-app");
  const publicNav    = document.getElementById("public-navbar");

  if (view === "login") {
    // Esconde tudo que não é login
    if (app)     app.classList.add("hidden");
    if (adminApp) adminApp.classList.add("hidden");
    if (landing) landing.classList.add("hidden");
    // Garante que a navbar pública está visível
    if (publicNav) publicNav.classList.remove("hidden");
    // Mostra o overlay de login
    if (loginOverlay) {
      loginOverlay.classList.remove("hidden");
      loginOverlay.classList.add("active");
    }
    // Atualiza botão da navbar
    if (btnPublicNav) {
      btnPublicNav.innerHTML = "🏠 Voltar para Home";
      btnPublicNav.setAttribute("onclick", "navigateTo('home')");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });

  } else {
    // view === 'home'
    // Esconde apps e login
    if (app)     app.classList.add("hidden");
    if (adminApp) adminApp.classList.add("hidden");
    if (publicNav) publicNav.classList.remove("hidden");
    // Esconde o overlay de login
    if (loginOverlay) {
      loginOverlay.classList.remove("active");
      loginOverlay.classList.add("hidden");
    }
    // Mostra a landing page
    if (landing) landing.classList.remove("hidden");
    // Atualiza botão da navbar
    if (btnPublicNav) {
      btnPublicNav.innerHTML = "🎓 Acessar Portal";
      btnPublicNav.setAttribute("onclick", "navigateTo('login')");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Alterna entre Home e Login (usado em links do menu ou botões).
 */
function toggleHomeLogin() {
  const loginOverlay = document.getElementById("login-overlay");
  const isLoginActive = loginOverlay && loginOverlay.classList.contains("active");
  navigateTo(isLoginActive ? "home" : "login");
}
