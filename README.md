# PE Livre Acesso — Intermunicipal

Breve descrição: aplicação web estática para apoio ao projeto PE Livre Acesso (módulo Intermunicipal), contendo páginas públicas, telas de login/gestão e componentes web reutilizáveis.

![Imagem do projeto](./imgproject.png)

---

## Índice
- Visão geral
- Estrutura do projeto
- Requisitos
- Como começar (local)
- Scripts npm
- Docker (opcional)
- Build e deploy
- Convenções e estilos
- Contribuição
- Licença

---

## Visão geral
Este repositório organiza os arquivos-fonte em `src/` (HTML, CSS, JS e assets) e gera uma saída estática em `public/` para publicação simples (ex.: servidor estático, Nginx, GitHub Pages com ajustes). O desenvolvimento local é feito com `live-server` para recarregamento rápido.

Principais pontos:
- HTMLs em `src/pages` (ex.: `index.html`, `login.html`, `forms.html`, `gestao/`).
- Componentes Web em `src/components` (ex.: `footer.js`).
- Estilos em `src/styles` e scripts em `src/scripts`.
- Assets (imagens/documentos) em `src/assets`.

---

## Estrutura do projeto
```
intermunicipal/
├─ src/
│  ├─ pages/        # HTML fonte (index.html, login.html, forms.html, gestao/...)
│  ├─ components/   # Web Components (navbar/footer etc.)
│  ├─ styles/       # CSS
│  ├─ scripts/      # JavaScript
│  └─ assets/       # Imagens, docs, dados
├─ public/          # Build estático (gerado pelo script de build)
├─ package.json
├─ Dockerfile
├─ docker-compose.yml
├─ DEVELOPMENT.md
└─ README.md
```

Notas:
- Alguns caminhos relativos nos HTMLs usam `../` (de `pages/` para `styles/`, `scripts/` e `../../assets`). Ajuste conforme a estratégia de deploy.

---

## Requisitos
- Node.js LTS (recomendado 18+)
- npm 9+

---

## Como começar (local)
1. Instale dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento (porta 3000):
   ```bash
   npm run dev
   ```
3. O navegador abrirá em `http://localhost:3000/pages/index.html`.

---

## Scripts npm
Os scripts disponíveis estão em `package.json`:

- `npm run dev` — inicia o `live-server` apontando para `src/` e abre `pages/index.html` na porta 3000.
- `npm run serve` — semelhante ao `dev`, mas não força a abertura de uma página específica.
- `npm run build` — cria/atualiza a pasta `public/` copiando o conteúdo de `src/` e duplica `src/pages/index.html` como `public/index.html` para facilitar deploy em raiz.

---

## Docker (opcional)
Rodar com Docker (quando disponível no ambiente):

- Usando script de conveniência:
  ```bash
  ./start-docker.sh
  ```
- Ou com Docker Compose:
  ```bash
  docker-compose up -d
  ```

Verifique os serviços conforme configuração dos arquivos `Dockerfile` e `docker-compose.yml`.

---

## Build e deploy
1. Gere o build estático:
   ```bash
   npm run build
   ```
2. Publique o conteúdo de `public/` no seu servidor estático (Nginx, Apache, S3/CloudFront etc.).

Observações importantes para GitHub Pages ou subpaths:
- Se o site for publicado em um subcaminho (ex.: `/org/projeto`), ajuste as referências relativas nos HTMLs ou utilize um bundler (ex.: Vite) com `base` configurada.

---

## Convenções e estilos
- HTML e componentes Web nativos (Custom Elements) quando possível.
- CSS organizado em `src/styles`. Considere consolidar e minimizar para produção.
- JavaScript modular em `src/scripts`. Evite globais quando possível.

Sugestões de próximos passos:
- Migrar para um bundler (ex.: Vite) para HMR, importação modular e otimizações.
- Configurar CI (lint, build e deploy automático).
- Adicionar testes (unitários e/ou e2e) conforme evolução.

---

## Contribuição
1. Crie um fork e branch: `git checkout -b feat/sua-feature`.
2. Faça commits descritivos.
3. Abra um Pull Request descrevendo o contexto, motivação e screenshots quando aplicável.

Padrões sugeridos:
- Commits no formato convencional (ex.: `feat:`, `fix:`, `chore:`).
- PRs pequenos e focados.

---


## Mantenedores
- SUPTI — SJDH

