// servidor/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(express.json());
app.use(cors());

// Pasta para uploads de PDF
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuração do multer (upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Aceita apenas PDF
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Apenas arquivos PDF são permitidos.'));
    }
    cb(null, true);
  }
});

// Caminho do arquivo de persistência
const DB_FILE = path.join(__dirname, 'debts.json');

// Funções utilitárias de leitura/gravação
function readDebtsFromFile() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Erro lendo debts.json:', err);
    return [];
  }
}

function writeDebtsToFile(debts) {
  fs.writeFileSync(DB_FILE, JSON.stringify(debts, null, 2), 'utf8');
}

// Validação no servidor
function validarDivida(body) {
  const errors = [];

  // Campos obrigatórios
  if (!body.cliente || typeof body.cliente !== 'object') {
    errors.push('Dados do cliente são obrigatórios.');
  } else {
    if (!body.cliente.nome || body.cliente.nome.trim() === '') {
      errors.push('Nome do cliente é obrigatório.');
    }
    if (!body.cliente.cpf || body.cliente.cpf.trim() === '') {
      errors.push('CPF do cliente é obrigatório.');
    }
    if (!body.cliente.email || body.cliente.email.trim() === '') {
      errors.push('Email do cliente é obrigatório.');
    }
  }

  if (body.valor == null || body.valor === '' || isNaN(Number(body.valor))) {
    errors.push('Valor da dívida é obrigatório e deve ser numérico.');
  }

  if (!body.descricao || body.descricao.trim() === '') {
    errors.push('Descrição (objeto da dívida) é obrigatória.');
  }

  if (!body.situacao || !['Pendente', 'Pago'].includes(body.situacao)) {
    errors.push('Situação deve ser "Pendente" ou "Pago".');
  }

  return errors;
}

// Rotas da API

// GET /debts -> lista todas
app.get('/debts', (req, res) => {
  const debts = readDebtsFromFile();
  res.json(debts);
});

// POST /debts -> cria nova dívida
// multipart/form-data por causa do PDF opcional
app.post('/debts', upload.single('comprovante'), (req, res) => {
  try {
    const body = JSON.parse(req.body.data); // dados vêm como JSON em um campo "data"
    const errors = validarDivida(body);

    if (errors.length > 0) {
      // Se vier arquivo e deu erro de validação, apaga o arquivo
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors });
    }

    const debts = readDebtsFromFile();

    const novaDivida = {
      id: uuidv4(),
      cliente: {
        nome: body.cliente.nome.trim(),
        cpf: body.cliente.cpf.trim(),
        email: body.cliente.email.trim(),
        endereco: {
          cep: body.cliente.endereco?.cep || '',
          numero: body.cliente.endereco?.numero || '',
          complemento: body.cliente.endereco?.complemento || ''
        }
      },
      valor: Number(body.valor),
      descricao: body.descricao.trim(),
      situacao: body.situacao,
      numeroProcesso: body.numeroProcesso || '',
      comprovantePath: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString()
    };

    debts.push(novaDivida);
    writeDebtsToFile(debts);

    res.status(201).json(novaDivida);
  } catch (err) {
    console.error('Erro ao criar dívida:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// DELETE /debts/:id -> exclui dívida
app.delete('/debts/:id', (req, res) => {
  const { id } = req.params;
  const debts = readDebtsFromFile();
  const index = debts.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Dívida não encontrada.' });
  }

  const [removida] = debts.splice(index, 1);
  writeDebtsToFile(debts);

  // Se tiver arquivo de comprovante, tenta apagar (opcional)
  if (removida.comprovantePath) {
    const fullPath = path.join(__dirname, removida.comprovantePath.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, () => {});
    }
  }

  res.json({ message: 'Dívida removida com sucesso.', id });
});

// Servir arquivos de upload (para baixar o PDF)
app.use('/uploads', express.static(uploadDir));

// *** ESSA PARTE É O QUE MANTÉM O SERVIDOR RODANDO ***
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
