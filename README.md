# Sistema de Gestão de Dívidas
Sistema web para gerenciamento de cadastro de dívidas de clientes.


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