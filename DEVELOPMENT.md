DEVELOPMENT GUIDE — PE LIVRE ACESSO INTERMUNICIPAL
===============================================

Resumo rápido
-------------
Este documento explica as mudanças que fizemos na reestruturação (mover arquivos para `src/`, centralizar assets em `src/assets/`, remover duplicados),
responde às suas perguntas (“o projeto é agora uma SPA?” e “é um projeto Node?”)
e descreve caminhos práticos e recomendados para dar continuidade ao desenvolvimento (opções, scripts, Docker, recomendações de build e deploy).

1) O projeto virou uma Single-Page Application (SPA)?
-------------------------------------------------
Curto: Não — ainda não.

Detalhes:
- O projeto atual é um site estático reorganizado em uma estrutura mais limpa: código fonte em `src/` (páginas HTML em `src/pages/`, CSS em `src/styles/`, JS em `src/scripts/`, assets em `src/assets/`).
- Cada HTML em `src/pages/` é uma página estática independente (por exemplo `index.html`, `forms.html`, `login.html`, `gestao/index.html`). Isso é um multi-page static site, não uma SPA.
- Uma SPA normalmente tem um único arquivo HTML que carrega um framework (React/Vue/Svelte) e usa roteamento no cliente para trocar “páginas” sem recarregar. Nossa reorganização facilita migrar para SPA no futuro (componentização, assets centralizados), mas não converteu as páginas em uma SPA automaticamente.

Quando dizeremos que o projeto é uma SPA?
- Quando escolhermos um framework cliente (ou Router JS) e consolidarmos as rotas em um único HTML (ex.: `index.html`) que importa os bundles JS que implementam navegação cliente.

2) O projeto é agora um projeto Node?
------------------------------------
Curto: Parcialmente — usamos Node apenas como ferramenta de desenvolvimento, mas a aplicação continua sendo estática.

Detalhes:
- Adicionamos um `package.json` com dependência dev (`live-server`) e scripts para facilitar desenvolvimento (`npm run dev`). Isso torna o repositório um "projeto Node" no sentido de que há um manifest para dev tools.
- Porém, o site em produção permanece estático (HTML/CSS/JS + assets). Não há servidor Node/Express rodando a aplicação de produção.
- Node foi incluído para conveniência (dev server, scripts, possíveis bundlers no futuro). Se você preferir zero-Node, podemos removê-lo; atualmente é apenas uma conveniência.

3) Principais diferenças introduzidas pela reestruturação
-----------------------------------------------------
- Antes: arquivos estavam misturados em `public/` e `assets/` com caminhos relativos variados.
- Agora: fonte organizada em `src/` com convenções claras:
  - `src/pages/` — páginas HTML fonte (mantenha aqui a edição)
  - `src/components/` — web components JS reutilizáveis
  - `src/styles/` — todos os CSS
  - `src/scripts/` — todos os JS
  - `src/assets/` — imagens, PDFs e dados (ex.: `cidades.txt`)
- Eliminamos duplicidade removendo as pastas antigas `public/` e `assets/` e atualizamos caminhos para usar `/assets/...` (root-relative quando servido a partir de `src/` no dev server).
- Adicionamos `package.json` com scripts básicos para dev.
- Atualizamos o Dockerfile (importante: o Dockerfile atual ainda copia `public/` e `assets/` — ver seção Docker abaixo). Você precisa escolher se o Docker deve servir:
  - A) diretamente a pasta `src/` (simples para static sites sem build), ou
  - B) uma pasta `public/` gerada por um step `build` (melhor para bundlers/otimização em produção).

4) Recomendações e caminhos possíveis (decisão arquitetural)
----------------------------------------------------------
Escolha uma estratégia a seguir; cada uma tem trade-offs.

Opção A — Manter site estático (mais simples)
- Características: cada HTML fica pronto para ser servido como estático. Adequado se não houver necessidade de SPA, HMR ou bundling.
- O que fazer:
  1. Usar o `src/` como source-of-truth durante desenvolvimento.
  2. Criar um script `build` simples que copia `src/` → `public/` (para Docker/NGINX) e otimiza assets opcionalmente.
  3. Atualizar o Dockerfile para copiar `public/` para /usr/share/nginx/html.
- Vantagens: simples, baixo custo, fácil deploy (NGINX estático). 

Opção B — Transformar em SPA com um bundler (recomendado se pretender crescer)
- Características: usar Vite (ou similar) para módulos ES, HMR, builds otimizados. Converter partes em componentes ESModules e usar roteador.
- O que fazer:
  1. Inicializar Vite ou criar app com framework desejado (React/Vue/Svelte).
  2. Converter `src/pages/*` em rotas do cliente ou migrar conteúdo para componentes.
  3. Atualizar `package.json` para incluir `dev` (vite), `build` (vite build) e `preview`.
  4. Dockerfile deve copiar o output de build (`dist/` ou `public/`) para NGINX.
- Vantagens: DX moderna, bundling, tree-shaking, HMR, fácil escalabilidade.

Opção C — Híbrido (Multi-page + bundler)
- Permite usar Vite para multi-page apps (Vite suporta multiple HTML entries). Mantém páginas separadas mas usa bundler para JS/CSS.
- Bom para migração incremental.

5) Ajustes necessários no Dockerfile ( explicação e exemplo )
-----------------------------------------------------------
Status atual (arquivo top-level antigo):

```dockerfile
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY public/ /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80
```

Problema: após reorganização removemos `public/` e `assets/`. O Dockerfile acima copia pastas que não existem mais.

Duas alternativas práticas:

A) Servir `src/` diretamente (rápido) — altera Dockerfile para copiar `src/` como site estático:

```dockerfile
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
# Copia o conteúdo do src (páginas, styles, scripts, assets)
COPY src/ /usr/share/nginx/html/

EXPOSE 80
```

Observações:
- Ao servir `src/` diretamente, caminhos root-relative `/assets/...` funcionarão se o servidor expuser o conteúdo no root.
- Vantagem: mais simples, sem etapa de build.

B) Melhor para produção: criar um passo `build` que gera `public/` e usar Docker para servir esse `public/`:

1. Adicionar script build (ex. em `package.json`):

```json
"scripts": {
  "dev": "live-server src --port=3000 --open=src/pages/index.html",
  "build": "rm -rf public && mkdir -p public && cp -R src/* public/"
}
```

2. Dockerfile (prod):

```dockerfile
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY public/ /usr/share/nginx/html/
EXPOSE 80
```

Observações:
- Permite inserir minificação/otimizações no processo `build` (imagem, css min, etc.).
- Recomendado para produção ou se você usar bundler que gera `dist/` (basta copiar `dist/` ao invés de `public/`).

6) Exemplo de `package.json` com scripts úteis (sugestão)
-------------------------------------------------------
Se seguir a opção A (static copy):

```json
{
  "name": "pe-livre-acesso-intermunicipal",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "live-server src --port=3000 --open=src/pages/index.html",
    "build": "rm -rf public && mkdir -p public && cp -R src/* public/",
    "start:docker": "docker build -t pelivre:latest . && docker run -p 80:80 pelivre:latest"
  },
  "devDependencies": {
    "live-server": "^1.2.2"
  }
}
```

Se seguir a opção B (Vite): use `vite` e scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview --port 5000"
}
```

7) Boas práticas e next steps práticos (passo a passo)
------------------------------------------------------
Recomendo o seguinte fluxo para decidir e implementar a estratégia certa:

1) Decidir modelo de desenvolvimento (Static / SPA / Híbrido).
2) Se for manter estático (Opção A):
   - Criar `npm run build` para copiar `src/` → `public/` automáticamente.
   - Atualizar `Dockerfile` para copiar `public/` (ou copiar `src/` diretamente se preferir).
   - Adicionar checks/CI: script que executa `npm run build` e valida 404s (optional).
3) Se migrar para Vite / SPA (Opção B):
   - Inicializar Vite (ou scaffold para framework desejado).
   - Converter componentes JS para ES modules (usar `type="module"` se necessário).
   - Migrar páginas ou criar rotas; criar layout/base component (navbar/footer) reutilizável.
   - Atualizar Dockerfile para copiar `dist/` (resultado do build).
4) Padronizar paths: prefira root-relative `/assets/...` ou configurar base path no bundler.
5) Adicionar lint/format: ESLint + Prettier (opcional mas recomendado).
6) Versionamento: adicione um commit com a nova estrutura e inclua esta documentação (`DEVELOPMENT.md`).

8) Checklist final — itens que posso executar para você (escolha os que quer que eu faça)
--------------------------------------------------------------------------------------
- [ ] 1) Atualizar o `Dockerfile` para copiar `src/` diretamente.
- [ ] 2) Criar script `build` simples (copy src -> public) e ajustar Dockerfile para usar `public/`.
- [ ] 3) Migrar para Vite (criar config e atualizar scripts, converter componentes para modules).
- [ ] 4) Fazer commit automático com mensagem explicando reestruturação.
- [ ] 5) Criar um README/deploy.md com comandos Docker prontos.

9) Perguntas rápidas para você (ajudam a escolher o caminho)
----------------------------------------------------------
- Você quer continuar com um site estático simples ou prefere migrar para um bundler (Vite + framework) agora?
- Deseja que eu já atualize o `Dockerfile` para produção (copiar `src/` como site estático) ou prefira uma solução com etapa `build` e `public/`?
- Quer que eu faça o commit automático dessas mudanças?

---
Se quiser eu aplico agora qualquer uma das ações do checklist (ex.: atualizar o Dockerfile para `src/` ou criar o script `build` + ajustar Dockerfile). Diga qual opção prefere e eu executo as mudanças e testo o container Docker localmente para validar.

