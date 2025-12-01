

## Estrutura de pastas
````bash
trabalho-m3/
│
├── web-service/                      # Servidor (API)
│   ├── src/
│   │   ├── server.js            # Arquivo principal do Express
│   │   ├── routes/
│   │   │   └── debts.js         # Rotas de dívidas
│   │   ├── controllers/
│   │   │   └── debtController.js # Lógica de negócio
│   │   ├── utils/
│   │   │   └── validation.js    # Funções de validação
│   │   └── config/
│   │       └── multer.js        # Configuração de upload
│   ├── data/
│   │   └── debts.json           # Arquivo de persistência
│   ├── uploads/                 # PDFs enviados
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