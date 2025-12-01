const express = require('express');
const router = express.Router();
const { upload } = require('./config/multer');
const { getAllDebts, createDebt, deleteDebt } = require('./controllers/debtController');

// Rotas da API
router.get('/debts', getAllDebts);
router.post('/debts', upload.single('comprovante'), createDebt);
router.delete('/debts/:id', deleteDebt);

module.exports = router;