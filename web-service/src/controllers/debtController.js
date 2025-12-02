const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { validarDivida } = require('../utils/validation');
const { readDebtsFromFile, writeDebtsToFile } = require('../utils/fileSystem');

// GET /debts -> lista todas
const getAllDebts = (req, res) => {
  try {
    const debts = readDebtsFromFile();
    res.status(200).json(debts);
  } catch (err) {
    console.error('Erro ao listar dívidas:', err);
    res.status(500).json({ error: 'Erro ao listar dívidas.' });
  }
};

// POST /debts -> cria nova dívida
// multipart/form-data por causa do PDF opcional
const createDebt = (req, res) => {
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
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// DELETE /debts/:id -> exclui dívida
const deleteDebt = (req, res) => {
  try {
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
      const fullPath = path.join(__dirname, '../../', removida.comprovantePath);
      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
          if (err) console.error('Erro ao apagar arquivo:', err);
        });
      }
    }

    res.status(200).json({ message: 'Dívida removida com sucesso.', id });
  } catch (err) {
    console.error('Erro ao deletar dívida:', err);
    res.status(500).json({ error: 'Erro ao deletar dívida.' });
  }
};

module.exports = { getAllDebts, createDebt, deleteDebt };