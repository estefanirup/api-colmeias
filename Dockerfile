# Imagem base
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /usr/src/app

# Copia arquivos de definição de dependências
COPY package*.json ./

# Instala dependências
RUN npm install --production

# Copia o restante do código da aplicação
COPY . .

# Define variável de ambiente para produção
ENV NODE_ENV=production

# Porta exposta (a mesma usada no Express)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]