// servidor/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const debtRoutes = require('./routes');
const { uploadDir } = require('./config/multer');

const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(express.json());
app.use(cors());

// Rotas da API
app.use('/api', debtRoutes);

// Servir arquivos de upload (para baixar o PDF)
app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
