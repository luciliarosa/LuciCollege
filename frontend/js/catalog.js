/* ══════════════════════════════════════════
   LUCI COLLEGE — catalog.js
   Catálogo de prêmios, filtros e modal de resgate
   ══════════════════════════════════════════ */

"use strict";

let allProducts    = [];
let activeCategory = "todos";
let selectedProduct = null;

/* ──────────────────────────────────────────
   CARREGAMENTO E RENDERIZAÇÃO
   ────────────────────────────────────────── */

/** Carrega produtos da API (ou usa dados demo como fallback). */
async function loadProducts() {
  const data = await API.get("/products");
  allProducts = (data && data.products) ? data.products : DEMO_PRODUCTS;
  renderProducts(allProducts);
}

/**
 * Renderiza os cards de produto na grade do catálogo.
 * @param {Array} list - Lista de produtos a exibir
 */
function renderProducts(list) {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `<p style="color:var(--text3);grid-column:1/-1;padding:40px 0;text-align:center">Nenhum prêmio encontrado.</p>`;
    return;
  }

  list.forEach((p, i) => {
    const canAfford = currentPoints >= p.pontos;
    const hasStock  = p.estoque > 0;
    const available = canAfford && hasStock;

    const card = document.createElement("div");
    card.className = `product-card${!available ? " unavailable" : ""}`;
    card.style.animationDelay = (i * 0.05) + "s";
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
          <button class="pc-btn${available ? "" : " disabled"}" ${available ? "" : "disabled"}>
            ${!hasStock ? "Esgotado" : !canAfford ? "Sem saldo" : "Resgatar"}
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

/* ──────────────────────────────────────────
   FILTROS
   ────────────────────────────────────────── */

/**
 * Define a categoria ativa e re-renderiza.
 * @param {HTMLElement} el - Botão de filtro clicado
 */
function setCategory(el) {
  document.querySelectorAll(".filter-tab[data-cat]").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  activeCategory = el.dataset.cat;
  filterProducts();
}

/** Filtra produtos pela categoria ativa e pelo texto do campo de busca. */
function filterProducts() {
  const q = document.getElementById("search-input").value.toLowerCase();
  renderProducts(
    allProducts.filter(p =>
      (activeCategory === "todos" || p.categoria === activeCategory) &&
      (p.nome.toLowerCase().includes(q) || p.descricao.toLowerCase().includes(q))
    )
  );
}

/* ──────────────────────────────────────────
   MODAL DE RESGATE
   ────────────────────────────────────────── */

/**
 * Abre o modal de detalhes e confirmação de resgate.
 * @param {object} product
 */
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

/** Fecha o modal de resgate. */
function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.body.style.overflow = "";
  selectedProduct = null;
}

// Fecha ao clicar no backdrop
document.getElementById("modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modal-overlay")) closeModal();
});

/** Confirma e processa o resgate do produto selecionado. */
async function confirmarResgate() {
  if (!selectedProduct) return;
  const btn = document.getElementById("btn-resgatar");
  btn.disabled = true;
  btn.textContent = "Processando...";
  await sleep(1000);

  let data = await API.post("/resgatar", { product_id: selectedProduct.id, user_id: currentUser.id });
  if (!data) data = { ok: true, pontos_restantes: currentPoints - selectedProduct.pontos };

  if (data.ok) {
    const pts        = selectedProduct.pontos;
    const nomePremio = selectedProduct.nome; // salva antes de closeModal zerar selectedProduct

    currentPoints                    = data.pontos_restantes;
    currentUser.pontos_disponiveis   = currentPoints;
    currentUser.resgates_total      += 1;
    currentUser.pontos_resgatados   += pts;

    allHistory.unshift({
      data:      new Date().toLocaleDateString("pt-BR"),
      premio:    selectedProduct.nome,
      emoji:     selectedProduct.imagem ? null : (selectedProduct.emoji || "🎁"),
      imagem:    selectedProduct.imagem || null,
      categoria: selectedProduct.categoria,
      pontos:    pts,
      status:    "pendente",
    });

    closeModal();
    updateUI();
    renderProducts(allProducts);
    renderHistory(allHistory);
    updateHistStats();
    showToast(`✅ "${nomePremio}" resgatado com sucesso! Retire na secretaria em até 15 dias.`, 5000);
  } else {
    showToast("❌ Erro ao processar o resgate. Tente novamente.");
    btn.disabled    = false;
    btn.textContent = "Resgatar agora";
  }
}
