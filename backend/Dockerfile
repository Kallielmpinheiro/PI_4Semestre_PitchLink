# Usar a versão específica do Python
FROM python:3.10.12

# Definir o diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema para PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# Criar e ativar um ambiente virtual (venv)
RUN python -m venv /env
ENV PATH="/env/bin:$PATH"

# Copiar o requirements.txt e instalar as dependências dentro do venv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o projeto Django
COPY . .

# Expor a porta padrão do Django
EXPOSE 8000

# Rodar o servidor do Django com hot reload
CMD ["python", "manage.py", "runserver"]