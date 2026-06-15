# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o projeto

Sistema web público para solicitação e gestão do **Cartão PE Livre Acesso Intermunicipal** — benefício do Governo de Pernambuco que garante gratuidade no transporte coletivo intermunicipal para pessoas com deficiência.

Desenvolvido pela SUPTI/SJDH-PE. Repositório: [sjdh-pe/intermunicipal](https://github.com/sjdh-pe/intermunicipal)

---

## Identidade visual institucional
- Qualquer artefato da SJDH/PE (relatórios, PDFs, dashboards, e-mails)
-  deve usar a skill `sjdh-identidade-visual`.

## Regras de Commit

Todos os commits devem ser escritos em **português do Brasil** e conter detalhes suficientes para entender a mudança sem precisar ler o diff:

- **Título:** resumo claro e direto do que foi feito (ex: `feat: adiciona validação de env vars obrigatórias`)
- **Corpo obrigatório:** explicar o quê, por quê e o impacto da mudança
- **Formato:**
  ```
  <tipo>: <resumo em pt-br>

  - O que mudou e onde
  - Por que a mudança foi necessária
  - Impacto ou comportamento anterior vs novo
  ```
- **Tipos permitidos:** `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
- Nunca usar mensagens genéricas como "ajustes", "correções", "update" sem contexto

## Regras de Documentação

Toda documentação do projeto deve ser mantida **atualizada e rica em detalhes** após qualquer alteração:

- Ao modificar endpoints, atualizar a tabela de funções em `src/services/beneficiariosService.js` neste CLAUDE.md
- Ao adicionar novos status de beneficiário, atualizar o `statusMap` em `src/pages/gestao/utils.js` e a tabela neste CLAUDE.md
- Ao adicionar novas páginas, atualizar a tabela de páginas e responsabilidades neste CLAUDE.md

## Regras gerais de trabalho
- Faça mudanças mínimas; não refatore código não solicitado.
- Sempre editar arquivos em `src/` — nunca em `public/` diretamente.
## Comandos

```bash
npm install          # instala dependências

npm run dev          # live-server em src/ na porta 4200, abre pages/home/index.html
npm run server       # json-server (mock API) na porta 3000, watch em db.json
npm run build        # copia src/ → public/ (necessário antes de usar o Docker)

docker-compose up -d # sobe nginx servindo public/ na porta 8080
```

> Para desenvolvimento, é necessário rodar `npm run dev` e `npm run server` simultaneamente em terminais separados.

---

## Arquitetura

### Estrutura de diretórios

```
src/               ← fonte de verdade (editar aqui)
  pages/           ← páginas HTML individuais (multi-page, não SPA)
  components/      ← Web Components (Custom Elements) reutilizáveis
  services/        ← cliente HTTP e lógica de autenticação
  styles/          ← CSS por escopo
  scripts/         ← scripts utilitários globais
  assets/          ← imagens, PDFs, cidades.txt

public/            ← build gerado por `npm run build` (não editar diretamente)
```

### Modelo de execução

O projeto é um **multi-page static site** — cada arquivo em `src/pages/*/index.html` é uma página independente. Não há bundler; os arquivos JS são carregados como ES Modules nativos do browser (`<script type="module">`).

Bibliotecas externas (Axios, SweetAlert2) são importadas diretamente via CDN no próprio código JS:

```js
import axios from "https://esm.sh/axios@1.7.7";
import Swal  from "https://esm.sh/sweetalert2@11";
```

Cropper.js e Feather Icons são carregados via tag `<script>` nos HTMLs.

### Páginas e responsabilidades

| Página | Acesso | Função |
|---|---|---|
| `pages/home/` | Público | Página inicial |
| `pages/cadastro/` | Público | Formulário de solicitação do cartão |
| `pages/valid/` | Público | Consulta de beneficiário por ID |
| `pages/login/` | Público | Login de usuários gestores |
| `pages/usuario/` | Autenticado | Perfil / logout |
| `pages/gestao/` | Autenticado | Painel de gestão de beneficiários |
| `pages/beneficiario/` | Autenticado | Detalhe de um beneficiário |

---

## Camada de serviços

### `src/services/api.js`

Instância global do Axios (`export const api`). Interceptors gerenciam:
- **Loader**: contador de requisições pendentes (`__pending`) para exibir/esconder overlay sem piscar
- **Token JWT**: injeta `Authorization: Bearer <token>` em todas as requisições autenticadas
- **Content-Type**: define `application/json` automaticamente, exceto para `FormData` (uploads)
- **Erros**: normaliza erros e exibe via SweetAlert2 com debounce de 600ms

`api.urlapi` expõe a baseURL para uso externo (ex.: montar URL da carteirinha).

**Troca de ambiente**: no topo de `api.js`, comente/descomente a `defaultBase` para alternar entre local e produção:

```js
const defaultBase = "http://localhost:3000";       // dev (json-server)
// const defaultBase = "http://api.sjdh.pe.gov.br"; // produção
```

### `src/services/auth.js`

Autenticação via JWT armazenado em `localStorage` com chave `app_auth_token`.

```js
// Inicialização (todas as páginas)
import { loadTokenOnStart } from '../services/auth.js';
loadTokenOnStart();

// Páginas que exigem login
import { requireAuth } from '../services/auth.js';
requireAuth(); // redireciona para /pages/usuario/ se não autenticado

// No handler do formulário de login
await login(username, password);
location.href = restoreRedirectAfterLogin('/');
```

`requireAuth()` salva a URL atual em `localStorage` (chave `redirect_after_login`) para redirecionar após login.

### `src/services/beneficiariosService.js`

Principais funções:

| Função | Endpoint |
|---|---|
| `listarBeneficiarios(...)` | `GET /beneficiarios?page=&size=&...` |
| `cadastrarBeneficiario(payload)` | `POST /beneficiarios` |
| `atualizarBeneficiario(id, data)` | `PUT /beneficiarios/{id}` |
| `atualizarBeneficiarioStatus(id, data)` | `POST /beneficiarios/{id}/status/{statusId}/motivos` |
| `uploadArquivoBeneficiario(id, tipoId, file)` | `POST /upload?id=&id_tipo_arquivo=` |
| `listarArquivosBeneficiario(id)` | `GET /beneficiarios/{id}/arquivos` |
| `validarBeneficiario(id)` | `GET /beneficiarios/{id}/validar` |
| `enviarEmailConfirmacao(beneficiario)` | `POST /email/html` |
| `enviarEmailAprovado(beneficiario)` | `POST /email/html` |

**Tipos de arquivo (`idTipoArquivo`)**:

| ID | Documento |
|---|---|
| 1 | RG |
| 2 | CPF |
| 3 | Foto 3x4 (passa pelo Cropper.js antes do upload) |
| 5 | Comprovante de Residência |
| 6 | Laudo Médico |

---

## Componentes Web (`src/components/`)

Todos são Custom Elements registrados globalmente:

- `<custom-footer>` — rodapé institucional com contatos da SJDH
- `<custom-navbar>` — barra de navegação
- `<custom-loader>` — overlay de carregamento (controlado por `src/components/loader.js`)
- `<accessibility-widget>` — controles de acessibilidade (alto contraste, ajuste de fonte, VLibras)
- `<option-cidades>` — popula selects com municípios de PE a partir de `src/assets/cidades.txt`

---

## Status dos beneficiários

| ID | Nome |
|---|---|
| 1 | Em análise |
| 2 | Pendente |
| 3 | Indeferido |
| 4 | Aprovado |
| 5 | Entregue |
| 6 | Enviadas para Confecção |
| 7 | Entregue aos Correios |
| 8 | Entregue ao Município |
| 9 | Disponível para Retirada |
| 10 | Em Processamento |
| 11 | Vencido |

A função `resolveStatus(beneficiario)` em `src/pages/gestao/utils.js` aceita tanto `statusId` (número) quanto `statusBeneficio` (string ou número) para resolver o status.

---

## Deploy com Docker

O `Dockerfile` serve o conteúdo de `public/` via nginx. **É obrigatório executar `npm run build` antes de buildar a imagem**, pois `public/` é um artefato gerado.

```bash
npm run build
docker-compose up -d   # porta 8080
```