# PE Livre Acesso Intermunicipal — Reestruturação

Estrutura proposta:

- src/
  - pages/         -> HTML fonte (index.html, login.html, forms.html, forms2.html, gestao/)
  - components/    -> Web components (gestao navbar/footer)
  - styles/        -> CSS fonte
  - scripts/       -> JS fonte
  - assets/        -> images, docs, data
- public/          -> (opcional) build / saída para deploy

O repositório foi reorganizado para melhorar manutenção. Os arquivos originais em `assets/` e `public/` foram copiados para `src/`.

Como rodar (opções):

1) Dev server rápido (live-server, zero-config)

```bash
# instalar dependências dev
npm install
# iniciar
npm run dev
```

2) Usar Vite (recomendado para projeto com módulos ES, HMR)
- Instale `vite` e ajuste `package.json` scripts: `dev: "vite"` e crie `vite.config.js` se necessário.

Notas:
- Os paths nos HTML dentro de `src/pages` foram ajustados para apontar para `../styles/`, `../scripts/` e `../../assets/...` onde relevante.
- Se pretende usar uma base path (ex.: GitHub Pages em subpath), atualize os links root-relative ou configure o bundler.

Próximos passos recomendados:
- Remover arquivos duplicados após validação.
- Consolidar CSS e JS, ou migrar para um bundler (Vite) e converter componentes para ES modules.
- Adicionar testes e CI se necessário.

