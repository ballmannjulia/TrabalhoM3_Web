const express = require('express');
const cors = require('cors');
const path = require('path');
const debtRoutes = require('./src/routes');

const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(express.json());
app.use(cors());

// Rotas da API
app.use('/', debtRoutes);

// Servir arquivos de upload (para baixar o PDF)
const uploadDir = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

// Rota de health check
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestão de Dívidas',
    version: '1.0.0',
    status: 'online'
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor.'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
