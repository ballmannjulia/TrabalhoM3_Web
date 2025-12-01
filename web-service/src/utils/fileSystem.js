const fs = require('fs');
const path = require('path');

// Caminho do arquivo de persistência
const DB_FILE = path.join(__dirname, '../../data/debts.json');

// Garante que a pasta data existe
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

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

module.exports = { readDebtsFromFile, writeDebtsToFile };