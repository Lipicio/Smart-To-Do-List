# Smart To-Do List

Aplicação **Full-Stack** moderna que permite gerenciar tarefas de forma inteligente, integrando **NestJS** no backend, **Next.js** no frontend e **SQLite** como banco de dados.  
O projeto é dockerizado para facilitar o setup e execução.

---

## 🏗 Estrutura do Projeto

smart-todo/\
├─ backend/ # Backend NestJS + SQLite + Dockerfile\
│ ├─ src/\
│ ├─ package.json\
│ ├─ Dockerfile\
│ └─ tsconfig.json\
├─ frontend/ # Frontend Next.js + Tailwind + React Compiler\
│ ├─ app/\
│ ├─ package.json\
│ ├─ Dockerfile\
│ ├─ tailwind.config.js\
│ └─ tsconfig.json\
├─ docker-compose.yml # Orquestração dos containers\
├─ .gitignore\
└─ README.md\


---

## 🚀 Pré-requisitos

- Docker  
- Docker Compose  
- Git  

> Não é necessário instalar Node.js ou SQLite localmente — tudo roda dentro dos containers.

---

## ⚡ Como rodar a aplicação

1. Clone o repositório:

```bash
git clone https://github.com/lipicio/Smart-To-Do-List.git
cd Smart-To-Do-List
```

2. Suba os containers Docker:

```bash
docker compose up -d --build
```

3. Verifique se os containers estão rodando:

```bash
docker compose ps
```

4. Teste os endpoints:

```bash
Backend NestJS: http://localhost:3001
Frontend Next.js: http://localhost:3000
```

---

## 🛠 Comandos úteis

- Ver logss:

```bash
docker logs -f <Nome_do_Container>
```

- Parar containers:

```bash
docker compose down
```

- Reiniciar containers:

```bash
docker compose restart
```

- Entrar em um container:

```bash
docker compose exec backend bash
docker compose exec frontend bash
```

---

## 📝 Observações

* A chave da API do Openrouter deve ser enviada pelo usuário a cada solicitação (a aplicação não irá armazenar o token)
* A aplicação utiliza Tailwind CSS, React Compiler e App Router no frontend para uma interface reativa e moderna.
* Backend NestJS está em modo desenvolvimento, permitindo hot reload.
* No backend utilizei o repository pattern (um dos pilares do DDD) para separar a camada de negócio e de infra, para isso utilizo injeção de dependencias e inversão de controle. Essa abordagem é interessate pois facilita a troca da estrutura de armazenamento de dados (Atualmente utilizando SQLite) e provedor de IA (Atualmente utilizando openrouter) sem compromenter a camada de negocio da aplicação. Também facilita (muito) a criação de testes unitários que, inclusive, foram contemplados no projeto e adicionados a pipeline do github.

---
