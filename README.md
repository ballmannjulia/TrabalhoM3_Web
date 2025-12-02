# Sistema de Gestão de Dívidas
Sistema web para gerenciamento de cadastro de dívidas de clientes.
Ele é dividido em dois módulos independentes:
- web-service → API REST (Node.js / Express)
- web-app → Cliente Web (HTML, CSS e JS puros)

## Como executar
**web-service**
1. Navegue até a pasta do backend:
```bash
cd web-service
```
2. Instale as dependências:
```bash
npm install
```
3. Inicie o servidor:
```bash
node src/server.js
```
O servidor estará rodando em http://localhost:3000

**web-app**
1. Abra o arquivo frontend/index.html no navegador
2. Ou utilize um servidor local como Live Server (VS Code)

## Estrutura de pastas
````bash
trabalho-m3/
│
├── web-service/                 # Servidor (API REST)
│   ├── src/
│   │   ├── routes.js            # Rotas do sistema
│   │   ├── controllers/
│   │   │   └── debtController.js # Lógica de negócio
│   │   ├── utils/
│   │   │   └── validation.js    # Funções de validação
│   │   └── config/
│   │       └── multer.js        # Configuração de upload
│   ├── data/
│   │   └── debts.json           # Arquivo de persistência
│   ├── uploads/                 # PDFs enviados
|   ├── server.js               # Arquivo principal do Express
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── web-app/                     # Cliente Web
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js               # Lógica principal
│   │   ├── api.js               # Chamadas à API
│   │   └── storage.js           # LocalStorage (cache)
│   └── assets/                  # Imagens, ícones, etc.
│
└── README.md                     # Documentação do projeto
```