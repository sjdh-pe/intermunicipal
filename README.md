# ♿ PE Livre Acesso Intermunicipal

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-green)

Projeto de interface web para a solicitação e consulta do cartão "PE Livre Acesso Intermunicipal", um benefício do Governo de Pernambuco destinado a garantir a gratuidade no transporte coletivo intermunicipal para pessoas com deficiência.

A aplicação foi desenvolvida com foco total em acessibilidade, usabilidade e responsividade, garantindo que todos os cidadãos possam interagir com a plataforma de forma simples e eficiente, contendo páginas públicas, telas de login/gestão e componentes web reutilizáveis.

![Imagem do projeto](./imgproject.png)

---

### Índice

- Visão Geral
- Estrutura do Projeto
- Tecnologias Utilizadas
- Requisitos
- Como Começar (Local)
- Scripts npm
- Docker (Opcional)
- Build e Deploy
- Convenções e Estilos
- Contribuição
- Licença
  
---

## Visão Geral

O objetivo principal desta aplicação é modernizar e facilitar o processo de solicitação do benefício PE Livre Acesso. Este repositório organiza os arquivos-fonte em `src/` (HTML, CSS, JS e assets) e gera uma saída estática em `public/` para publicação simples (ex.: servidor estático, Nginx, GitHub Pages com ajustes). O desenvolvimento local é feito com `live-server` para recarregamento rápido.

Principais pontos:
- HTMLs em `src/pages` (ex.: `index.html`, `login.html`, `forms.html`, `gestao/`).
- Componentes Web em `src/components` (ex.: `footer.js`).
- Estilos em `src/styles` e scripts em `src/scripts`.
- Assets (imagens/documentos) em `src/assets`.

#### Funcionalidades Implementadas:

- **Design Responsivo:** A interface se adapta perfeitamente a dispositivos móveis, tablets e desktops.
- **Validação de Formulário:** Feedback visual imediato para o usuário em caso de campos obrigatórios não preenchidos.
- **Consulta de Endereço via CEP:** Integração com a API ViaCEP para preenchimento automático de endereço.
- **Recursos Avançados de Acessibilidade:**
- **VLibras:** Widget integrado para tradução de conteúdo para a Língua Brasileira de Sinais.
- **Alto Contraste:** Modo claro e escuro para melhorar a legibilidade.
- **Ajuste de Fonte:** Controles para aumentar e diminuir o tamanho do texto.
- **Semântica e `alt` text:** Uso correto de tags HTML e textos alternativos em todas as imagens para compatibilidade com leitores de tela.

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

## Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias e ferramentas:

- **POC**
  - `Figma`
  - [Acessar Figma]([./imgproject.png](https://www.figma.com/design/waCd55uaLJ4absuAMCIgz1/POC-PE-LIVRE-ACESSO-INTERMUNICIPAL?node-id=0-1&t=9TDXSltn95WiaKYj-1))

- **Front-end:**
  - `HTML5`
  - `CSS3`
  - `JavaScript` (Vanilla)

- **Bibliotecas e Frameworks:**
  - `Bootstrap 5`: Para a estrutura e componentes do formulário.
  - `jQuery` e `jQuery Mask Plugin`: Para a aplicação de máscaras nos campos de CPF, telefone e CEP.

- **Acessibilidade:**
  - `Widget VLibras`: Ferramenta oficial do Governo Federal para tradução em Libras.

- **Ambiente de Desenvolvimento:**
  - `Docker` e `Docker Compose`: Para garantir a portabilidade e facilitar a execução do ambiente de desenvolvimento.

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
- Desenvolvedores:
  - **Erick Carrasco** E-mail: erick.carrasco@sjdh.gov.pe.br - [GitHub](https://github.com/kcarrasc0)
  - **Raul França** E-mail: raul.franca@sjdh.gov.pe.br - [GitHub](https://github.com/raul-franca)
