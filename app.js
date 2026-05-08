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
  { id:1,  nome:"Mochila Luci College",     descricao:"Mochila resistente com logo bordado. Compartimentos para notebook 15\", USB embutido.", imagem: "./img/MochilaLuci.png", categoria:"mochila",   pontos:2500, estoque:8  },
  { id:2,  nome:"Caderno A5 Luci",          descricao:"Caderno capa dura A5, 200 páginas pautadas, com logomarca Luci College.",               imagem: "./img/CadernoLuci.png", categoria:"papelaria", pontos:600,  estoque:25 },
  { id:3,  nome:"Vale Salgado — Cantina",   descricao:"Um salgado à escolha na cantina central. Válido por 30 dias.",                          imagem:"./img/ValeCantinaLuci.png", categoria:"servico",   pontos:200,  estoque:99 },
  { id:4,  nome:"Kit Canetas (6un)",        descricao:"Kit com 6 canetas esferográficas azuis, pretas e vermelhas com logo Luci.",            imagem:"./img/KitCanetaLuci.png", categoria:"papelaria", pontos:300,  estoque:40 },
  { id:5,  nome:"Chaveiro Metálico Luci",   descricao:"Chaveiro em metal com acabamento fosco e gravação do brasão Luci College.",             imagem:"./img/ChaveiroLuci.png", categoria:"acessorio", pontos:150,  estoque:60 },
  { id:6,  nome:"Estojo Tech Luci",         descricao:"Estojo rígido com zíper duplo, porta estilete, porta USB e espaço para cabos.",         imagem:"./img/EstojoLuci.png", categoria:"papelaria", pontos:900,  estoque:15 },
  { id:7,  nome:"Garrafa Térmica 500ml",    descricao:"Garrafa inox 500ml, mantém temperatura por até 12h. Logo Luci em relevo.",              imagem:"./img/GarrafaLuci.png", categoria:"acessorio", pontos:1200, estoque:10 },
  { id:8,  nome:"Vale Almoço — Rest. U.",   descricao:"Almoço completo no Restaurante Universitário. Prato, salada e sobremesa.",              imagem:"./img/ValeAlmocoLuci.png", categoria:"servico",   pontos:450,  estoque:30 },
  { id:9,  nome:"Caneca Luci Tech",         descricao:"Caneca de porcelana 350ml com design exclusivo da turma de Tecnologia.",                imagem:"./img/CanecaLuci.png", categoria:"acessorio", pontos:500,  estoque:20 },
  { id:10, nome:"Impressão A4 — 50 folhas", descricao:"Crédito de 50 impressões A4 P&B nas impressoras do campus. Expira em 60 dias.",        imagem:"./img/ImpressaoLuci.png", categoria:"servico",   pontos:350,  estoque:99 },
  { id:11, nome:"Mochila Slim Luci Pro",    descricao:"Versão slim premium com sistema anti-roubo e alças acolchoadas ergonômicas.",           imagem:"./img/MochilaSlimLuci.png", categoria:"mochila",   pontos:3500, estoque:4  },
  { id:12, nome:"Agenda 2025 Luci",         descricao:"Agenda semanal capa dura 2025 com calendário acadêmico e datas de avaliações.",         imagem:"./img/AgendaLuci.png", categoria:"papelaria", pontos:750,  estoque:18 },
];

const DEMO_HISTORY = [
  { data:"15/05/2025", premio:"Estojo Tech Luci",         imagem:"./img/EstojoLuci.png", categoria:"papelaria", pontos:900, status:"aprovado"  },
  { data:"02/04/2025", premio:"Kit Canetas (6un)",         imagem:"./img/KitCanetaLuci.png", categoria:"papelaria", pontos:300, status:"aprovado"  },
  { data:"10/03/2025", premio:"Vale Salgado — Cantina",   imagem:"./img/ValeCantinaLuci.png", categoria:"servico",   pontos:200, status:"pendente"  },
  { data:"21/01/2025", premio:"Caderno A5 Luci",          imagem:"./img/CadernoLuci.png", categoria:"papelaria", pontos:600, status:"aprovado"  },
  { data:"05/12/2024", premio:"Chaveiro Metálico Luci",   imagem:"./img/ChaveiroLuci.png", categoria:"acessorio", pontos:150, status:"entregue"  },
  { data:"18/11/2024", premio:"Vale Almoço — Rest. U.",   imagem:"./img/ValeAlmocoLuci.png", categoria:"servico",   pontos:450, status:"cancelado" },
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
  const catalogHeader = document.querySelector(".catalog-header");
  const hero          = document.querySelector(".hero");
  const productsGrid  = document.getElementById("products-grid");

  productsGrid.style.display  = sec === "catalogo" ? "grid"  : "none";
  catalogHeader.style.display = sec === "catalogo" ? "block" : "none";
  hero.style.display          = sec === "catalogo" ? "flex"  : "none";

  toggleSection("historico", sec === "historico");
  toggleSection("ranking",   sec === "ranking");
  toggleSection("perfil",    sec === "perfil");

  if (sec === "perfil") renderPerfil();
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

    const imgContent = p.imagem
      ? `<img src="${p.imagem}" alt="${p.nome}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
      : (p.emoji || "🎁");

    card.innerHTML = `
      <div class="pc-img">${imgContent}<span class="pc-badge ${p.categoria}">${catLabel(p.categoria)}</span></div>
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
  const modalImg = document.getElementById("modal-img");
  if (product.imagem) {
    modalImg.innerHTML = `<img src="${product.imagem}" alt="${product.nome}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
  } else {
    modalImg.textContent = product.emoji || "🎁";
  }
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
    allHistory.unshift({ 
      data: new Date().toLocaleDateString("pt-BR"), 
      premio: selectedProduct.nome, 
      emoji: selectedProduct.imagem ? null : (selectedProduct.emoji || "🎁"),
      imagem: selectedProduct.imagem || null,
      categoria: selectedProduct.categoria, 
      pontos: pts, 
      status: "pendente" });    
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
          ${h.imagem
  ? `<img src="${h.imagem}" alt="${h.premio}" style="width:28px;height:28px;object-fit:cover;border-radius:4px;">`
  : `<span style="font-size:20px">${h.emoji||"🎁"}</span>`
}
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


/* ══════════════════════════════════════════
   MODAL REGULAMENTO
   ══════════════════════════════════════════ */
function openRegulamento() {
  document.getElementById('modal-regulamento').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeRegulamento(e) {
  // FIX: removed the erroneous classList.remove('hidden') line that was here before
  if (e && e.target !== document.getElementById('modal-regulamento')) return;
  document.getElementById('modal-regulamento').classList.add('hidden');
  document.body.style.overflow = '';
}

function openSuporteModal() {
  document.getElementById('modal-suporte').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSuporteModal(e) {
  if (e && e.target !== document.getElementById('modal-suporte')) return;
  document.getElementById('modal-suporte').classList.add('hidden');
  document.body.style.overflow = '';
}

function openSecretariaModal() {
  document.getElementById('modal-secretaria').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSecretariaModal(e) {
  if (e && e.target !== document.getElementById('modal-secretaria')) return;
  document.getElementById('modal-secretaria').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════
   PERFIL DO ALUNO
   ══════════════════════════════════════════ */

/* Tipo de atividade ativo no filtro */
let activeAtivType = "todos";

const DEMO_ATIVIDADES = {
  "2025-1": [
    // Maio 2025
    { data:"20/05/2025", tipo:"presenca", descricao:"Aula — Eng. de Software IV", status:"ganhou",     pontos:100, detalhe:"Frequência: 80%"  },
    { data:"19/05/2025", tipo:"prova",    descricao:"Prova P2 — Banco de Dados",  status:"ganhou",     pontos:420, detalhe:"Nota: 8,4"        },
    { data:"17/05/2025", tipo:"presenca", descricao:"Aula — Redes e Protocolos",  status:"nao_ganhou", pontos:0,   detalhe:"Frequência: 60%",  motivo_nao:"Frequência abaixo de 75%" },
    { data:"14/05/2025", tipo:"trabalho", descricao:"TDE — UX e Prototipagem",    status:"ganhou",     pontos:100, detalhe:"Entregue no prazo" },
    { data:"12/05/2025", tipo:"presenca", descricao:"Aula — Cálculo Numérico",    status:"ganhou",     pontos:100, detalhe:"Frequência: 100%" },
    { data:"08/05/2025", tipo:"evento",   descricao:"Semana da Computação 2025",  status:"ganhou",     pontos:500, detalhe:"Participação completa" },
    // Abril 2025
    { data:"28/04/2025", tipo:"presenca", descricao:"Aula — Eng. de Software IV", status:"ganhou",     pontos:100, detalhe:"Frequência: 90%"  },
    { data:"25/04/2025", tipo:"prova",    descricao:"Prova P1 — Compiladores",    status:"nao_ganhou", pontos:0,   detalhe:"Nota: 3,5",        motivo_nao:"Nota abaixo do mínimo (5,0)" },
    { data:"22/04/2025", tipo:"trabalho", descricao:"TDE — Análise de Algoritmos",status:"ganhou",     pontos:100, detalhe:"Entregue no prazo" },
    { data:"18/04/2025", tipo:"presenca", descricao:"Aula — Banco de Dados II",   status:"ganhou",     pontos:100, detalhe:"Frequência: 85%"  },
    { data:"10/04/2025", tipo:"prova",    descricao:"Prova P1 — Banco de Dados",  status:"ganhou",     pontos:380, detalhe:"Nota: 7,6"        },
    { data:"05/04/2025", tipo:"indicacao",descricao:"Indicação de colega",        status:"ganhou",     pontos:300, detalhe:"Lucas Ribeiro matriculado" },
    // Março 2025
    { data:"28/03/2025", tipo:"trabalho", descricao:"TDE — Estruturas de Dados",  status:"nao_ganhou", pontos:0,   detalhe:"Entregue com atraso", motivo_nao:"Entrega fora do prazo" },
    { data:"24/03/2025", tipo:"presenca", descricao:"Aula — Compiladores",        status:"ganhou",     pontos:100, detalhe:"Frequência: 75%"  },
    { data:"20/03/2025", tipo:"presenca", descricao:"Aula — Cálculo Numérico",    status:"nao_ganhou", pontos:0,   detalhe:"Frequência: 50%",  motivo_nao:"Frequência abaixo de 75%" },
    { data:"15/03/2025", tipo:"evento",   descricao:"Hackathon Luci 2025",        status:"ganhou",     pontos:800, detalhe:"3º lugar na competição" },
    { data:"10/03/2025", tipo:"prova",    descricao:"Prova P1 — Compiladores",    status:"ganhou",     pontos:460, detalhe:"Nota: 9,2"        },
    { data:"05/03/2025", tipo:"presenca", descricao:"Aula — Redes e Protocolos",  status:"ganhou",     pontos:100, detalhe:"Frequência: 80%"  },
    // Fevereiro 2025
    { data:"27/02/2025", tipo:"presenca", descricao:"Aula — Eng. de Software IV", status:"ganhou",     pontos:100, detalhe:"Frequência: 100%" },
    { data:"20/02/2025", tipo:"trabalho", descricao:"TDE — Requisitos de Software",status:"ganhou",    pontos:100, detalhe:"Entregue no prazo" },
    { data:"13/02/2025", tipo:"presenca", descricao:"Aula — Banco de Dados II",   status:"nao_ganhou", pontos:0,   detalhe:"Faltou",           motivo_nao:"Frequência abaixo de 75%" },
    { data:"06/02/2025", tipo:"evento",   descricao:"Palestra — IA na Indústria", status:"ganhou",     pontos:200, detalhe:"Presença confirmada" },
  ],
  "2024-2": [
    { data:"10/12/2024", tipo:"prova",    descricao:"Prova Final — Álgebra Linear",status:"ganhou",    pontos:490, detalhe:"Nota: 9,8"        },
    { data:"05/12/2024", tipo:"trabalho", descricao:"TDE — Projeto Final Eng. SW", status:"ganhou",    pontos:100, detalhe:"Entregue no prazo" },
    { data:"28/11/2024", tipo:"presenca", descricao:"Aula — Álgebra Linear",       status:"ganhou",    pontos:100, detalhe:"Frequência: 90%"  },
    { data:"20/11/2024", tipo:"evento",   descricao:"ENCOINFO 2024",               status:"ganhou",    pontos:400, detalhe:"Participação completa" },
    { data:"15/11/2024", tipo:"prova",    descricao:"Prova P2 — Eng. de Software", status:"nao_ganhou",pontos:0,   detalhe:"Nota: 4,0",        motivo_nao:"Nota abaixo do mínimo (5,0)" },
    { data:"08/11/2024", tipo:"presenca", descricao:"Aula — POO Avançada",         status:"ganhou",    pontos:100, detalhe:"Frequência: 85%"  },
    { data:"25/10/2024", tipo:"prova",    descricao:"Prova P2 — Álgebra Linear",   status:"ganhou",    pontos:350, detalhe:"Nota: 7,0"        },
    { data:"18/10/2024", tipo:"trabalho", descricao:"TDE — Design Patterns",       status:"nao_ganhou",pontos:0,   detalhe:"Não entregue",     motivo_nao:"Trabalho não entregue"    },
    { data:"10/10/2024", tipo:"presenca", descricao:"Aula — Álgebra Linear",       status:"ganhou",    pontos:100, detalhe:"Frequência: 80%"  },
    { data:"02/10/2024", tipo:"indicacao",descricao:"Indicação de colega",         status:"ganhou",    pontos:300, detalhe:"Pedro Gomes matriculado" },
  ],
  "2024-1": [
    { data:"15/06/2024", tipo:"prova",    descricao:"Prova Final — Cálculo I",     status:"ganhou",    pontos:440, detalhe:"Nota: 8,8"        },
    { data:"10/06/2024", tipo:"trabalho", descricao:"TDE — Modelagem de Dados",    status:"ganhou",    pontos:100, detalhe:"Entregue no prazo" },
    { data:"05/06/2024", tipo:"presenca", descricao:"Aula — Programação Web",      status:"ganhou",    pontos:100, detalhe:"Frequência: 100%" },
    { data:"20/05/2024", tipo:"prova",    descricao:"Prova P2 — Cálculo I",        status:"nao_ganhou",pontos:0,   detalhe:"Nota: 4,5",        motivo_nao:"Nota abaixo do mínimo (5,0)" },
    { data:"15/05/2024", tipo:"evento",   descricao:"Semana da TI 2024",           status:"ganhou",    pontos:300, detalhe:"Participação completa" },
    { data:"10/04/2024", tipo:"prova",    descricao:"Prova P1 — Cálculo I",        status:"ganhou",    pontos:500, detalhe:"Nota: 10,0"       },
    { data:"05/04/2024", tipo:"presenca", descricao:"Aula — Algoritmos",           status:"nao_ganhou",pontos:0,   detalhe:"Frequência: 40%",  motivo_nao:"Frequência abaixo de 75%" },
    { data:"20/03/2024", tipo:"trabalho", descricao:"TDE — Lógica de Programação", status:"ganhou",    pontos:100, detalhe:"Entregue no prazo" },
    { data:"10/03/2024", tipo:"presenca", descricao:"Aula — Cálculo I",            status:"ganhou",    pontos:100, detalhe:"Frequência: 75%"  },
    { data:"01/03/2024", tipo:"evento",   descricao:"Aula Inaugural 2024/1",       status:"ganhou",    pontos:200, detalhe:"Presença confirmada" },
  ],
};

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

const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MESES_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function setAtivType(el) {
  document.querySelectorAll(".filter-tab[data-atype]").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  activeAtivType = el.dataset.atype;
  renderAtividades();
}

function renderPerfil() {
  if (!currentUser) return;

  /* ── dados do aluno ── */
  const nomes   = currentUser.nome.split(" ");
  const iniciais = (nomes[0]?.[0] || "") + (nomes[1]?.[0] || "");
  setEl("perfil-avatar-iniciais", iniciais.toUpperCase());
  setEl("perfil-nivel-badge",     getLevel(currentUser.pontos_disponiveis));

  /* título com nome dividido */
  const tituloEl = document.getElementById("perfil-nome-titulo");
  if (tituloEl) tituloEl.innerHTML = `${nomes[0]}<br/><em>${nomes.slice(1).join(" ")}</em>`;

  setEl("perfil-curso",      currentUser.curso      || "—");
  setEl("perfil-matricula",  currentUser.matricula   || "—");
  setEl("perfil-email",      currentUser.email       || `${currentUser.matricula?.toLowerCase()}@luci.edu.br`);
  setEl("perfil-pts-disp",   formatNum(currentUser.pontos_disponiveis));
  setEl("perfil-pts-total",  formatNum(currentUser.pontos_disponiveis + currentUser.pontos_resgatados));
  setEl("perfil-resgates",   currentUser.resgates_total);

  /* posição no ranking */
  const myIdx = allRanking.findIndex(r => r.me);
  setEl("perfil-pos-ranking", myIdx >= 0 ? `#${myIdx + 1}º` : "—");

  renderAtividades();
}

function renderAtividades() {
  const semestre = document.getElementById("perfil-semestre-sel")?.value || "2025-1";
  const tipo     = activeAtivType;
  const todas    = DEMO_ATIVIDADES[semestre] || [];
  const filtradas = todas.filter(a => tipo === "todos" || a.status === tipo);

  /* ── Resumo do semestre ── */
  const totalGanhou    = todas.filter(a => a.status === "ganhou").length;
  const totalNaoGanhou = todas.filter(a => a.status === "nao_ganhou").length;
  const ptsGanhos      = todas.filter(a => a.status === "ganhou").reduce((s, a) => s + a.pontos, 0);

  const resumoEl = document.getElementById("perfil-semestre-resumo");
  if (resumoEl) {
    resumoEl.innerHTML = `
      <div class="psr-card">
        <span class="psr-icon">⚡</span>
        <div class="psr-info">
          <span class="psr-num green">+${formatNum(ptsGanhos)}</span>
          <span class="psr-label">Pontos no semestre</span>
        </div>
      </div>
      <div class="psr-card">
        <span class="psr-icon">✅</span>
        <div class="psr-info">
          <span class="psr-num green">${totalGanhou}</span>
          <span class="psr-label">Atividades com pontos</span>
        </div>
      </div>
      <div class="psr-card">
        <span class="psr-icon">❌</span>
        <div class="psr-info">
          <span class="psr-num red">${totalNaoGanhou}</span>
          <span class="psr-label">Atividades sem pontos</span>
        </div>
      </div>
      <div class="psr-card">
        <span class="psr-icon">📊</span>
        <div class="psr-info">
          <span class="psr-num">${totalGanhou + totalNaoGanhou > 0 ? Math.round((totalGanhou / (totalGanhou + totalNaoGanhou)) * 100) : 0}%</span>
          <span class="psr-label">Taxa de aproveitamento</span>
        </div>
      </div>
    `;
  }

  /* ── Agrupa por mês ── */
  const timelineEl = document.getElementById("perfil-timeline");
  if (!timelineEl) return;

  if (!filtradas.length) {
    timelineEl.innerHTML = `<p class="perfil-empty">Nenhuma atividade encontrada para este filtro.</p>`;
    return;
  }

  /* Monta mapa mês → atividades */
  const porMes = new Map();
  filtradas.forEach(a => {
    const partes = a.data.split("/");
    const key    = `${partes[2]}-${partes[1]}`; // "2025-05"
    if (!porMes.has(key)) porMes.set(key, []);
    porMes.get(key).push(a);
  });

  /* Ordena meses do mais recente para o mais antigo */
  const mesesOrdenados = [...porMes.keys()].sort((a, b) => b.localeCompare(a));

  timelineEl.innerHTML = mesesOrdenados.map(key => {
    const [ano, mes] = key.split("-");
    const mesIdx     = parseInt(mes, 10) - 1;
    const ativs      = porMes.get(key);
    const ptsMes     = ativs.filter(a => a.status === "ganhou").reduce((s, a) => s + a.pontos, 0);

    const badgeClass = ptsMes > 0 ? "ganhou" : "zero";
    const badgeText  = ptsMes > 0 ? `+${formatNum(ptsMes)} pts` : "0 pts";

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