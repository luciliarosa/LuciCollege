/* ══════════════════════════════════════════
   LUCI COLLEGE — app.js
   Frontend logic, API integration, UI state
   ══════════════════════════════════════════ */

"use strict";

/* ─── STATE ─── */
let currentUser    = null;
let currentPoints  = 0;
let allProducts    = [];
let allHistory     = [];
let allRanking     = [];
let activeCategory   = "todos";
let activeHistStatus = "todos";
let activeRankCurso  = "todos";
let selectedProduct  = null;

/* ─── DEMO DATA ─── */
const DEMO_USER = {
  id: 1, nome: "Ana Luíza Ferreira", matricula: "LC2024001",
  curso: "Engenharia de Software", pontos_disponiveis: 3850, pontos_resgatados: 1200, resgates_total: 4,
};

const DEMO_PRODUCTS = [
  { id:1,  nome:"Mochila Luci College",     descricao:"Mochila resistente com logo bordado. Compartimentos para notebook 15\", USB embutido.", emoji:"🎒", categoria:"mochila",   pontos:2500, estoque:8  },
  { id:2,  nome:"Caderno A5 Luci",          descricao:"Caderno capa dura A5, 200 páginas pautadas, com logomarca Luci College.",               emoji:"📓", categoria:"papelaria", pontos:600,  estoque:25 },
  { id:3,  nome:"Vale Salgado — Cantina",   descricao:"Um salgado à escolha na cantina central. Válido por 30 dias.",                          emoji:"🥪", categoria:"servico",   pontos:200,  estoque:99 },
  { id:4,  nome:"Kit Canetas (6un)",         descricao:"Kit com 6 canetas esferográficas azuis, pretas e vermelhas com logo Luci.",            emoji:"🖊️", categoria:"papelaria", pontos:300,  estoque:40 },
  { id:5,  nome:"Chaveiro Metálico Luci",   descricao:"Chaveiro em metal com acabamento fosco e gravação do brasão Luci College.",             emoji:"🔑", categoria:"acessorio", pontos:150,  estoque:60 },
  { id:6,  nome:"Estojo Tech Luci",         descricao:"Estojo rígido com zíper duplo, porta estilete, porta USB e espaço para cabos.",         emoji:"💼", categoria:"papelaria", pontos:900,  estoque:15 },
  { id:7,  nome:"Garrafa Térmica 500ml",    descricao:"Garrafa inox 500ml, mantém temperatura por até 12h. Logo Luci em relevo.",              emoji:"🫙", categoria:"acessorio", pontos:1200, estoque:10 },
  { id:8,  nome:"Vale Almoço — Rest. U.",   descricao:"Almoço completo no Restaurante Universitário. Prato, salada e sobremesa.",              emoji:"🍱", categoria:"servico",   pontos:450,  estoque:30 },
  { id:9,  nome:"Caneca Luci Tech",         descricao:"Caneca de porcelana 350ml com design exclusivo da turma de Tecnologia.",                emoji:"☕", categoria:"acessorio", pontos:500,  estoque:20 },
  { id:10, nome:"Impressão A4 — 50 folhas", descricao:"Crédito de 50 impressões A4 P&B nas impressoras do campus. Expira em 60 dias.",        emoji:"🖨️", categoria:"servico",   pontos:350,  estoque:99 },
  { id:11, nome:"Mochila Slim Luci Pro",    descricao:"Versão slim premium com sistema anti-roubo e alças acolchoadas ergonômicas.",           emoji:"🎒", categoria:"mochila",   pontos:3500, estoque:4  },
  { id:12, nome:"Agenda 2025 Luci",         descricao:"Agenda semanal capa dura 2025 com calendário acadêmico e datas de avaliações.",         emoji:"📅", categoria:"papelaria", pontos:750,  estoque:18 },
];

const DEMO_HISTORY = [
  { data:"15/05/2025", premio:"Estojo Tech Luci",         emoji:"💼", categoria:"papelaria", pontos:900, status:"aprovado"  },
  { data:"02/04/2025", premio:"Kit Canetas (6un)",         emoji:"🖊️", categoria:"papelaria", pontos:300, status:"aprovado"  },
  { data:"10/03/2025", premio:"Vale Salgado — Cantina",   emoji:"🥪", categoria:"servico",   pontos:200, status:"pendente"  },
  { data:"21/01/2025", premio:"Caderno A5 Luci",          emoji:"📓", categoria:"papelaria", pontos:600, status:"aprovado"  },
  { data:"05/12/2024", premio:"Chaveiro Metálico Luci",   emoji:"🔑", categoria:"acessorio", pontos:150, status:"entregue"  },
  { data:"18/11/2024", premio:"Vale Almoço — Rest. U.",   emoji:"🍱", categoria:"servico",   pontos:450, status:"cancelado" },
];

const DEMO_RANKING = [
  { nome:"Carlos Eduardo Silva",  iniciais:"CE", curso:"Ciência da Computação",  pontos:6420, me:false },
  { nome:"Mariana Souza Faria",   iniciais:"MS", curso:"Engenharia de Software", pontos:5890, me:false },
  { nome:"Rafael Lima Andrade",   iniciais:"RL", curso:"Análise e Sistemas",     pontos:5210, me:false },
  { nome:"Ana Luíza Ferreira",    iniciais:"AL", curso:"Engenharia de Software", pontos:5050, me:true  },
  { nome:"Juliana Pires Mello",   iniciais:"JP", curso:"Redes de Computadores",  pontos:4700, me:false },
  { nome:"Bruno Carvalho Rocha",  iniciais:"BC", curso:"Cybersecurity",          pontos:4300, me:false },
  { nome:"Letícia Alves Santos",  iniciais:"LA", curso:"Ciência da Computação",  pontos:3990, me:false },
  { nome:"Pedro Henrique Gomes",  iniciais:"PH", curso:"Análise e Sistemas",     pontos:3760, me:false },
  { nome:"Fernanda Castro Lima",  iniciais:"FC", curso:"Engenharia de Software", pontos:3520, me:false },
  { nome:"Diego Mendes Rocha",    iniciais:"DM", curso:"Ciência da Computação",  pontos:3100, me:false },
  { nome:"Camila Torres Nunes",   iniciais:"CT", curso:"Análise e Sistemas",     pontos:2980, me:false },
  { nome:"Lucas Ribeiro Viana",   iniciais:"LR", curso:"Cybersecurity",          pontos:2750, me:false },
];

/* ─── API ─── */
const API = {
  base: "/api",
  async post(path, body) {
    try { const r = await fetch(this.base+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); return await r.json(); }
    catch { return null; }
  },
  async get(path) {
    try { return await (await fetch(this.base+path)).json(); } catch { return null; }
  },
};

/* ══════════════════════════════════════════
   LOGIN
   ══════════════════════════════════════════ */
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
  await sleep(800);

  let data = await API.post("/login", { matricula, senha });
  if (!data) data = (matricula==="LC2024001"&&senha==="luci123") ? {ok:true,user:DEMO_USER} : {ok:false};

  btnText.classList.remove("hidden");
  btnLoader.classList.add("hidden");

  if (data && data.ok) { currentUser = data.user; currentPoints = data.user.pontos_disponiveis; enterApp(); }
  else { err.classList.remove("hidden"); }
});

function togglePass() { const i=document.getElementById("senha"); i.type=i.type==="password"?"text":"password"; }

/* ══════════════════════════════════════════
   APP INIT
   ══════════════════════════════════════════ */
async function enterApp() {
  document.getElementById("login-overlay").classList.remove("active");
  document.getElementById("app").classList.remove("hidden");
  updateUI();
  await loadProducts();
  await loadHistory();
  await loadRanking();
  initNav();
}

function updateUI() {
  const nome = currentUser.nome.split(" ")[0];
  const pct  = Math.min(100, Math.round((currentUser.pontos_disponiveis/5000)*100));
  setEl("hero-greeting",    `Olá, ${nome}!`);
  setEl("pts-disponiveis",  formatNum(currentUser.pontos_disponiveis));
  setEl("pts-resgatados",   formatNum(currentUser.pontos_resgatados));
  setEl("resgates-total",   currentUser.resgates_total);
  setEl("header-pts",       formatNum(currentUser.pontos_disponiveis));
  setEl("pts-nivel-label",  getLevel(currentUser.pontos_disponiveis));
  setTimeout(() => { document.getElementById("pts-bar").style.width = pct+"%"; }, 300);
}

function getLevel(pts) {
  if (pts>=5000) return "Nível Platinum ✦";
  if (pts>=3000) return "Nível Ouro ★";
  if (pts>=1500) return "Nível Prata";
  return "Nível Iniciante";
}

/* ══════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════ */
function initNav() {
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      showSection(link.dataset.section);
    });
  });
}

function showSection(sec) {
  document.getElementById("products-grid").style.display  = sec==="catalogo" ? "grid"  : "none";
  document.getElementById("catalog-header").style.display = sec==="catalogo" ? "block" : "none";
  document.querySelector(".hero").style.display           = sec==="catalogo" ? "flex"  : "none";
  toggleSection("historico", sec==="historico");
  toggleSection("ranking",   sec==="ranking");
}

function toggleSection(id, show) {
  const el = document.getElementById(id);
  show ? el.classList.remove("hidden") : el.classList.add("hidden");
}

/* ══════════════════════════════════════════
   PRODUTOS
   ══════════════════════════════════════════ */
async function loadProducts() {
  const data = await API.get("/products");
  allProducts = (data&&data.products) ? data.products : DEMO_PRODUCTS;
  renderProducts(allProducts);
}

function renderProducts(list) {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";
  if (!list.length) { grid.innerHTML=`<p style="color:var(--text3);grid-column:1/-1;padding:40px 0;text-align:center">Nenhum prêmio encontrado.</p>`; return; }
  list.forEach((p, i) => {
    const canAfford = currentPoints >= p.pontos;
    const hasStock  = p.estoque > 0;
    const available = canAfford && hasStock;
    const card = document.createElement("div");
    card.className = `product-card${!available?" unavailable":""}`;
    card.style.animationDelay = (i*0.05)+"s";
    if (available) card.onclick = () => openModal(p);
    card.innerHTML = `
      <div class="pc-img">${p.emoji}<span class="pc-badge ${p.categoria}">${catLabel(p.categoria)}</span></div>
      <div class="pc-body">
        <span class="pc-name">${p.nome}</span>
        <span class="pc-desc">${p.descricao}</span>
        <div class="pc-footer">
          <div><div class="pc-pts">${formatNum(p.pontos)}</div><div class="pc-pts-label">pontos</div></div>
          <button class="pc-btn${available?"":" disabled"}" ${available?"":"disabled"}>
            ${!hasStock?"Esgotado":!canAfford?"Sem saldo":"Resgatar"}
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function catLabel(cat) { return {mochila:"Mochila",papelaria:"Papelaria",servico:"Serviço",acessorio:"Acessório"}[cat]||cat; }

function setCategory(el) {
  document.querySelectorAll(".filter-tab[data-cat]").forEach(t=>t.classList.remove("active"));
  el.classList.add("active"); activeCategory=el.dataset.cat; filterProducts();
}

function filterProducts() {
  const q = document.getElementById("search-input").value.toLowerCase();
  renderProducts(allProducts.filter(p=>(activeCategory==="todos"||p.categoria===activeCategory)&&(p.nome.toLowerCase().includes(q)||p.descricao.toLowerCase().includes(q))));
}

/* ══════════════════════════════════════════
   MODAL
   ══════════════════════════════════════════ */
function openModal(product) {
  selectedProduct = product;
  const canAfford = currentPoints >= product.pontos;
  setEl("modal-cat",   catLabel(product.categoria));
  setEl("modal-title", product.nome);
  setEl("modal-desc",  product.descricao);
  setEl("modal-pts",   formatNum(product.pontos));
  document.getElementById("modal-img").textContent = product.emoji;
  const warn = document.getElementById("modal-saldo-warning");
  canAfford ? warn.classList.add("hidden") : warn.classList.remove("hidden");
  document.getElementById("btn-resgatar").disabled = !canAfford;
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.body.style.overflow = "";
  selectedProduct = null;
}

document.getElementById("modal-overlay").addEventListener("click", e => { if(e.target===document.getElementById("modal-overlay")) closeModal(); });

async function confirmarResgate() {
  if (!selectedProduct) return;
  const btn = document.getElementById("btn-resgatar");
  btn.disabled = true; btn.textContent = "Processando...";
  await sleep(1000);

  let data = await API.post("/resgatar", {product_id:selectedProduct.id, user_id:currentUser.id});
  if (!data) data = {ok:true, pontos_restantes: currentPoints - selectedProduct.pontos};

  if (data.ok) {
    const pts = selectedProduct.pontos;
    currentPoints = data.pontos_restantes;
    currentUser.pontos_disponiveis = currentPoints;
    currentUser.resgates_total += 1;
    currentUser.pontos_resgatados += pts;
    allHistory.unshift({ data:new Date().toLocaleDateString("pt-BR"), premio:selectedProduct.nome, emoji:selectedProduct.emoji, categoria:selectedProduct.categoria, pontos:pts, status:"pendente" });
    closeModal(); updateUI(); renderProducts(allProducts); renderHistory(allHistory); updateHistStats();
    showToast(`✅ Resgate de "${selectedProduct.nome}" realizado!`);
  } else {
    showToast("❌ Erro ao processar o resgate. Tente novamente.");
    btn.disabled = false; btn.textContent = "Resgatar agora";
  }
}

/* ══════════════════════════════════════════
   HISTÓRICO
   ══════════════════════════════════════════ */
async function loadHistory() {
  const data = await API.get(`/historico/${currentUser.id}`);
  allHistory = (data&&data.historico) ? data.historico : DEMO_HISTORY;
  renderHistory(allHistory);
  updateHistStats();
}

function renderHistory(list) {
  const q      = (document.getElementById("hist-search")?.value||"").toLowerCase();
  const status = activeHistStatus;
  const filtered = list.filter(h=>(status==="todos"||h.status===status)&&h.premio.toLowerCase().includes(q));
  const tbody = document.getElementById("history-body");

  if (!filtered.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5" style="text-align:center;color:var(--text3);padding:60px">Nenhum resgate encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(h=>`
    <tr>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--text3);white-space:nowrap">${h.data}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">${h.emoji||"🎁"}</span>
          <span style="font-weight:500;color:var(--text)">${h.premio}</span>
        </div>
      </td>
      <td><span class="cat-pill">${catLabel(h.categoria||"outro")}</span></td>
      <td style="font-family:var(--font-head);font-weight:700;color:var(--accent3)">${formatNum(h.pontos)}</td>
      <td><span class="status-badge ${h.status}">${statusLabel(h.status)}</span></td>
    </tr>`).join("");
}

function updateHistStats() {
  setEl("hist-total-resgates", allHistory.length);
  setEl("hist-total-pts",      formatNum(allHistory.reduce((s,h)=>s+(h.pontos||0),0)));
  setEl("hist-aprovados",      allHistory.filter(h=>h.status==="aprovado"||h.status==="entregue").length);
  setEl("hist-pendentes",      allHistory.filter(h=>h.status==="pendente").length);
}

function setHistStatus(el) {
  document.querySelectorAll(".filter-tab[data-hstatus]").forEach(t=>t.classList.remove("active"));
  el.classList.add("active"); activeHistStatus=el.dataset.hstatus; renderHistory(allHistory);
}

function filterHistory() { renderHistory(allHistory); }

function statusLabel(s) { return {aprovado:"Aprovado",pendente:"Pendente",cancelado:"Cancelado",entregue:"Entregue"}[s]||s; }

/* ══════════════════════════════════════════
   RANKING
   ══════════════════════════════════════════ */
async function loadRanking() {
  const data = await API.get("/ranking");
  allRanking = (data&&data.ranking) ? data.ranking : DEMO_RANKING;
  renderPodium(allRanking);
  renderMyBanner(allRanking);
  renderRanking(allRanking);
}

function renderPodium(list) {
  const top3 = list.slice(0,3);
  // Visual: 2º | 1º | 3º
  [[1,2],[0,1],[2,3]].forEach(([dataIdx,n])=>{
    const p = top3[dataIdx];
    if (!p) return;
    setEl(`pod-av-${n}`, p.iniciais);
    setEl(`pod-nm-${n}`, p.nome.split(" ")[0]);
    setEl(`pod-pt-${n}`, formatNum(p.pontos)+" pts");
  });
}

function renderMyBanner(list) {
  const myIdx = list.findIndex(r=>r.me);
  if (myIdx<0) return;
  const me   = list[myIdx];
  const pos  = myIdx+1;
  const prev = myIdx>0 ? list[myIdx-1] : null;
  setEl("my-rank-pos",  `#${pos}º lugar`);
  setEl("my-rank-pts",  formatNum(me.pontos));
  setEl("my-rank-diff", prev ? `Faltam ${formatNum(prev.pontos-me.pontos)} pts para o #${pos-1}º lugar` : "🏆 Você está em 1º lugar!");
}

function renderRanking(list) {
  const q       = (document.getElementById("rank-search")?.value||"").toLowerCase();
  const curso   = activeRankCurso;
  const filtered = list.filter(r=>(curso==="todos"||r.curso===curso)&&r.nome.toLowerCase().includes(q));
  const maxPts   = filtered.length ? filtered[0].pontos : 1;
  const el       = document.getElementById("ranking-list");

  if (!filtered.length) {
    el.innerHTML=`<p style="color:var(--text3);padding:40px 0;text-align:center">Nenhum aluno encontrado.</p>`;
    return;
  }

  el.innerHTML = filtered.map((r,i)=>{
    const pos      = list.indexOf(r)+1;
    const posClass = pos===1?"gold":pos===2?"silver":pos===3?"bronze":"";
    const posStr   = pos<=3?["🥇","🥈","🥉"][pos-1]:`#${pos}`;
    const barPct   = Math.round((r.pontos/maxPts)*100);
    return `
      <div class="ranking-item ${r.me?"me":""}" style="animation-delay:${i*0.04}s">
        <span class="rank-pos ${posClass}">${posStr}</span>
        <div class="rank-avatar">${r.iniciais}</div>
        <div class="rank-info">
          <div class="rank-name">
            ${r.nome}
            ${r.me?'<span class="rank-me-tag">VOCÊ</span>':""}
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

function setRankCurso(el) {
  document.querySelectorAll(".filter-tab[data-rcurso]").forEach(t=>t.classList.remove("active"));
  el.classList.add("active"); activeRankCurso=el.dataset.rcurso; renderRanking(allRanking);
}

function filterRanking() { renderRanking(allRanking); }

/* ══════════════════════════════════════════
   LOGOUT / TOAST / UTILS
   ══════════════════════════════════════════ */
function logout() {
  currentUser=null; currentPoints=0; allProducts=[]; allHistory=[]; allRanking=[];
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-overlay").classList.add("active");
  document.getElementById("matricula").value="";
  document.getElementById("senha").value="";
  document.getElementById("login-error").classList.add("hidden");
}

function showToast(msg, duration=3500) {
  const t=document.getElementById("toast");
  t.textContent=msg; t.classList.remove("hidden");
  clearTimeout(t._timer); t._timer=setTimeout(()=>t.classList.add("hidden"),duration);
}

function formatNum(n) { return Number(n).toLocaleString("pt-BR"); }
function sleep(ms) { return new Promise(r=>setTimeout(r,ms)); }
function setEl(id,val) { const el=document.getElementById(id); if(el) el.textContent=val; }
