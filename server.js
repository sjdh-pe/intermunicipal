import jsonServer from 'json-server';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const SECRET_KEY = 'seu-secret-key-desenvolvimento';

// ⚠️ ROTA DE LOGIN DEVE FICAR ANTES DO MIDDLEWARE DE PROTEÇÃO
// Endpoint de autenticação (sem proteção)
server.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios' });
  }

  // Ler dados do db.json
  const db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
  const user = db.users?.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Gerar JWT
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });

  res.json({
    tokenType: 'Bearer',
    accessToken: token,
    expiresIn: 86400 // 24 horas em segundos
  });
});

// Rota para profile (exemplo)
server.get('/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, SECRET_KEY);
    res.json({
      id: 1,
      username: '12345678901',
      name: 'Usuário Teste'
    });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

// Middleware para proteger rotas autenticadas (após rotas públicas)
server.use((req, res, next) => {
  if (req.path.startsWith('/beneficiarios') || req.path.startsWith('/gestao') || req.path.startsWith('/upload')) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
      jwt.verify(token, SECRET_KEY);
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } else {
    next();
  }
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server rodando em http://localhost:3000');
  console.log('Usuário de teste: 12345678901 / 123456');
});
