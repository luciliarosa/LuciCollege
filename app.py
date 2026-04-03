"""
══════════════════════════════════════════════════════════
  LUCI COLLEGE — Portal de Prêmios
  Backend: Python + Flask + PostgreSQL
  Arquivo: backend/app.py
══════════════════════════════════════════════════════════
"""

import os
import hashlib
import json
from datetime import datetime, date
from functools import wraps

from flask import Flask, request, jsonify, send_from_directory, session
import psycopg2
import psycopg2.extras

# ─── CONFIG ───────────────────────────────────────────
app = Flask(
    __name__,
    static_folder="../static",
    template_folder="../templates",
)

app.secret_key = os.environ.get("SECRET_KEY", "luci-college-secret-dev-key")

DB_CONFIG = {
    "host":     os.environ.get("DB_HOST",     "localhost"),
    "port":     int(os.environ.get("DB_PORT", 5432)),
    "dbname":   os.environ.get("DB_NAME",     "luci_college"),
    "user":     os.environ.get("DB_USER",     "luciliadospassosrosa"),
    "password": os.environ.get("DB_PASSWORD", ""),
}


# ─── DB CONNECTION ─────────────────────────────────────
def get_db():
    """Retorna conexão com o banco PostgreSQL."""
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    return conn


def query(sql, params=None, fetch="all"):
    """Helper genérico para executar queries."""
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            if fetch == "one":
                result = cur.fetchone()
            elif fetch == "all":
                result = cur.fetchall()
            else:
                result = None
            conn.commit()
            return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# ─── AUTH DECORATOR ────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"ok": False, "error": "Não autenticado"}), 401
        return f(*args, **kwargs)
    return decorated


# ─── UTILS ─────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def serialize(row):
    """Converte RealDictRow para dict serializável."""
    if row is None:
        return None
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, (datetime, date)):
            d[k] = v.strftime("%d/%m/%Y")
    return d


# ══════════════════════════════════════════════════════
#  ROTAS ESTÁTICAS
# ══════════════════════════════════════════════════════

@app.route("/")
def index():
    return send_from_directory(app.template_folder, "index.html")


@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory(app.static_folder, path)


# ══════════════════════════════════════════════════════
#  API — AUTENTICAÇÃO
# ══════════════════════════════════════════════════════

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "error": "Dados inválidos"}), 400

    matricula = data.get("matricula", "").strip().upper()
    senha     = data.get("senha", "")

    if not matricula or not senha:
        return jsonify({"ok": False, "error": "Campos obrigatórios"}), 400

    user = query(
        """
        SELECT id, nome, matricula, curso,
               pontos_disponiveis, pontos_resgatados
        FROM alunos
        WHERE matricula = %s AND senha_hash = %s AND ativo = TRUE
        """,
        (matricula, hash_password(senha)),
        fetch="one",
    )

    if not user:
        return jsonify({"ok": False, "error": "Credenciais inválidas"}), 401

    # Conta total de resgates aprovados
    total_resgates = query(
        "SELECT COUNT(*) AS total FROM resgates WHERE aluno_id = %s AND status = 'aprovado'",
        (user["id"],),
        fetch="one",
    )

    user_dict = serialize(user)
    user_dict["resgates_total"] = total_resgates["total"] if total_resgates else 0

    session["user_id"]   = user_dict["id"]
    session["matricula"] = user_dict["matricula"]

    return jsonify({"ok": True, "user": user_dict})


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})


# ══════════════════════════════════════════════════════
#  API — PRODUTOS (Catálogo)
# ══════════════════════════════════════════════════════

@app.route("/api/products", methods=["GET"])
def get_products():
    categoria = request.args.get("categoria")
    search    = request.args.get("q", "")

    sql = """
        SELECT id, nome, descricao, emoji, categoria, pontos, estoque
        FROM premios
        WHERE ativo = TRUE
    """
    params = []

    if categoria and categoria != "todos":
        sql += " AND categoria = %s"
        params.append(categoria)

    if search:
        sql += " AND (nome ILIKE %s OR descricao ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    sql += " ORDER BY pontos ASC"

    rows = query(sql, params, fetch="all")
    products = [serialize(r) for r in rows] if rows else []
    return jsonify({"ok": True, "products": products})


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    row = query(
        "SELECT * FROM premios WHERE id = %s AND ativo = TRUE",
        (product_id,),
        fetch="one",
    )
    if not row:
        return jsonify({"ok": False, "error": "Prêmio não encontrado"}), 404
    return jsonify({"ok": True, "product": serialize(row)})


# ══════════════════════════════════════════════════════
#  API — RESGATES
# ══════════════════════════════════════════════════════

@app.route("/api/resgatar", methods=["POST"])
@login_required
def resgatar():
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "error": "Dados inválidos"}), 400

    product_id = data.get("product_id")
    user_id    = session["user_id"]

    if not product_id:
        return jsonify({"ok": False, "error": "product_id obrigatório"}), 400

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:

            # 1. Busca prêmio
            cur.execute(
                "SELECT id, nome, pontos, estoque FROM premios WHERE id = %s AND ativo = TRUE FOR UPDATE",
                (product_id,),
            )
            premio = cur.fetchone()
            if not premio:
                return jsonify({"ok": False, "error": "Prêmio não encontrado"}), 404
            if premio["estoque"] <= 0:
                return jsonify({"ok": False, "error": "Prêmio esgotado"}), 409

            # 2. Busca saldo do aluno
            cur.execute(
                "SELECT pontos_disponiveis FROM alunos WHERE id = %s AND ativo = TRUE FOR UPDATE",
                (user_id,),
            )
            aluno = cur.fetchone()
            if not aluno:
                return jsonify({"ok": False, "error": "Aluno não encontrado"}), 404

            if aluno["pontos_disponiveis"] < premio["pontos"]:
                return jsonify({"ok": False, "error": "Saldo insuficiente"}), 402

            # 3. Debita pontos do aluno
            cur.execute(
                """
                UPDATE alunos
                SET pontos_disponiveis = pontos_disponiveis - %s,
                    pontos_resgatados  = pontos_resgatados  + %s
                WHERE id = %s
                """,
                (premio["pontos"], premio["pontos"], user_id),
            )

            # 4. Decrementa estoque
            cur.execute(
                "UPDATE premios SET estoque = estoque - 1 WHERE id = %s",
                (product_id,),
            )

            # 5. Registra resgate
            cur.execute(
                """
                INSERT INTO resgates (aluno_id, premio_id, pontos_gastos, status, data_resgate)
                VALUES (%s, %s, %s, 'pendente', NOW())
                RETURNING id
                """,
                (user_id, product_id, premio["pontos"]),
            )

            # 6. Busca pontos atualizados
            cur.execute(
                "SELECT pontos_disponiveis FROM alunos WHERE id = %s",
                (user_id,),
            )
            updated = cur.fetchone()

            conn.commit()
            return jsonify({
                "ok":               True,
                "pontos_restantes": updated["pontos_disponiveis"],
                "premio":           premio["nome"],
            })

    except Exception as e:
        conn.rollback()
        app.logger.error(f"Erro no resgate: {e}")
        return jsonify({"ok": False, "error": "Erro interno"}), 500
    finally:
        conn.close()


# ══════════════════════════════════════════════════════
#  API — HISTÓRICO
# ══════════════════════════════════════════════════════

@app.route("/api/historico/<int:user_id>", methods=["GET"])
@login_required
def historico(user_id):
    if session["user_id"] != user_id:
        return jsonify({"ok": False, "error": "Não autorizado"}), 403

    rows = query(
        """
        SELECT
            TO_CHAR(r.data_resgate, 'DD/MM/YYYY') AS data,
            p.nome AS premio,
            r.pontos_gastos AS pontos,
            r.status
        FROM resgates r
        JOIN premios p ON p.id = r.premio_id
        WHERE r.aluno_id = %s
        ORDER BY r.data_resgate DESC
        LIMIT 50
        """,
        (user_id,),
        fetch="all",
    )
    historico_list = [dict(r) for r in rows] if rows else []
    return jsonify({"ok": True, "historico": historico_list})


# ══════════════════════════════════════════════════════
#  API — RANKING
# ══════════════════════════════════════════════════════

@app.route("/api/ranking", methods=["GET"])
def ranking():
    rows = query(
        """
        SELECT
            nome,
            UPPER(LEFT(SPLIT_PART(nome, ' ', 1), 1) || LEFT(SPLIT_PART(nome, ' ', 2), 1)) AS iniciais,
            curso,
            pontos_disponiveis + pontos_resgatados AS pontos
        FROM alunos
        WHERE ativo = TRUE
        ORDER BY pontos DESC
        LIMIT 20
        """,
        fetch="all",
    )
    ranking_list = [dict(r) for r in rows] if rows else []

    # Marca o usuário logado
    user_id = session.get("user_id")
    if user_id:
        user = query("SELECT nome FROM alunos WHERE id = %s", (user_id,), fetch="one")
        if user:
            for item in ranking_list:
                item["me"] = (item["nome"] == user["nome"])

    return jsonify({"ok": True, "ranking": ranking_list})


# ══════════════════════════════════════════════════════
#  API — ADMIN (gestão de pontos)
# ══════════════════════════════════════════════════════

@app.route("/api/admin/add-pontos", methods=["POST"])
def add_pontos():
    """Adiciona pontos a um aluno. Requer token admin no header."""
    token = request.headers.get("X-Admin-Token")
    if token != os.environ.get("ADMIN_TOKEN", "luci-admin-2025"):
        return jsonify({"ok": False, "error": "Não autorizado"}), 403

    data = request.get_json()
    matricula = data.get("matricula")
    pontos    = int(data.get("pontos", 0))
    motivo    = data.get("motivo", "Adição manual")

    if pontos <= 0:
        return jsonify({"ok": False, "error": "Pontos inválidos"}), 400

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "UPDATE alunos SET pontos_disponiveis = pontos_disponiveis + %s WHERE matricula = %s RETURNING id, pontos_disponiveis",
                (pontos, matricula.upper()),
            )
            aluno = cur.fetchone()
            if not aluno:
                return jsonify({"ok": False, "error": "Aluno não encontrado"}), 404

            cur.execute(
                "INSERT INTO movimentos_pontos (aluno_id, pontos, motivo, tipo) VALUES (%s, %s, %s, 'credito')",
                (aluno["id"], pontos, motivo),
            )
            conn.commit()
            return jsonify({"ok": True, "pontos_atuais": aluno["pontos_disponiveis"]})
    except Exception as e:
        conn.rollback()
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        conn.close()


# ─── RUN ──────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
