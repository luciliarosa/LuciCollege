FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependências
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copia todo o projeto
COPY . /app

# Porta exposta (Render injeta a variável PORT dinamicamente)
EXPOSE 5000

# Inicia com Gunicorn ouvindo na porta definida por $PORT (ou 5000 como fallback)
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 2 --threads 4 backend.app:app"]
