FROM python:3.10.12

WORKDIR /app

# Instalar libs do sistema e netcat via openbsd
RUN apt-get update && \
    apt-get install -y libpq-dev netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

RUN python -m venv /env
ENV PATH="/env/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8001", "backend.asgi:application"]