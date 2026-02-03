
# Validação 

## Explicação do funcionamento:
* login() chama a API e salva accessToken + tokenType + expiresAt em localStorage.

* loadTokenOnStart() restaura o cabeçalho Authorization se o token ainda for válido.

* isAuthenticated() verifica validade.

* requireAuth() redireciona para a página de login se não estiver autenticado (salva URL atual para voltar após login).

  * Exemplo de uso: 
  1- chame loadTokenOnStart() ao inicializar e requireAuth() nas páginas que precisam de login;
  2- No formulário de login chame login() e redirecione.

## Path do arquivo:
    src/services/auth.js

## Como usar:
    
    1- No script de inicialização (executado em todas as páginas):
```javascript

    import { loadTokenOnStart } from '../services/auth.js';
    loadTokenOnStart();
```

    2- No topo de cada página protegida:
```javascript

    import { requireAuth } from '../services/auth.js';
    requireAuth(); // redireciona ao login se necessário
```

    3- No handler do formulário de login:
```javascript
    
    import { login, restoreRedirectAfterLogin } from '../services/auth.js';
    
    const form = document.querySelector('#login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = form.querySelector('[name=username]').value;
        const password = form.querySelector('[name=password]').value;
        await login(username, password);
        const dest = restoreRedirectAfterLogin('/');
        location.href = dest;
    });
```