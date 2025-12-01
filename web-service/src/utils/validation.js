
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

module.exports = { validarDivida };