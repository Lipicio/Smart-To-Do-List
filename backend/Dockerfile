# Base image
FROM node:20-alpine
WORKDIR /app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia todo o código fonte
COPY . .

# Expor a porta do NestJS
EXPOSE 3001

# Comando para rodar em modo desenvolvimento
CMD ["npm", "run", "start:dev:docker"]
