# Usar a versão específica do Node.js
FROM node:18.20.5

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos de dependências (package.json e package-lock.json)
COPY package.json package-lock.json ./

# Instalar a versão específica do Angular CLI globalmente
RUN npm install -g @angular/cli@19.0.4
RUN npm install -g @angular-devkit/build-angular@19.0.4
# Instalar as dependências do projeto Angular
RUN npm install

# Copiar o restante dos arquivos do projeto para o container
COPY . .

# Expor a porta em que o Angular vai rodar (geralmente 4200)
EXPOSE 4200

# Rodar o servidor de desenvolvimento do Angular
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]