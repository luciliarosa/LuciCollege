/* ══════════════════════════════════════════
   LUCI COLLEGE — api.js
   Camada de comunicação com a API REST (Flask)
   ══════════════════════════════════════════ */

"use strict";

/**
 * Objeto API centralizado com métodos GET e POST.
 * Em modo demo (sem servidor), retorna null e o chamador usa dados locais.
 */
const API = {
  base: "/api",

  /**
   * Realiza uma requisição POST com corpo JSON.
   * @param {string} path  - Caminho da rota (ex: "/login")
   * @param {object} body  - Objeto a ser serializado como JSON
   * @returns {Promise<object|null>}
   */
  async post(path, body) {
    try {
      const response = await fetch(this.base + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch {
      return null;
    }
  },

  /**
   * Realiza uma requisição GET.
   * @param {string} path - Caminho da rota (ex: "/products")
   * @returns {Promise<object|null>}
   */
  async get(path) {
    try {
      const response = await fetch(this.base + path);
      return await response.json();
    } catch {
      return null;
    }
  },
};
