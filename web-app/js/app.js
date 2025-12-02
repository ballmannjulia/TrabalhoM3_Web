let debts = [];
let currentFilter = '';

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadDebts();
    checkServerStatus();
});

// EVENT LISTENERS
function initializeEventListeners() {
    // Botões de abrir/fechar modal de formulário
    document.getElementById('openFormBtn').addEventListener('click', openFormModal);
    document.getElementById('closeFormModal').addEventListener('click', closeFormModal);
    document.getElementById('cancelFormBtn').addEventListener('click', closeFormModal);

    // Formulário de cadastro
    const form = document.getElementById('debtForm');
    form.addEventListener('submit', handleFormSubmit);

    // Máscaras de input
    document.getElementById('cpf').addEventListener('input', maskCPF);
    document.getElementById('cep').addEventListener('input', maskCEP);

    // Botão de atualizar
    document.getElementById('refreshBtn').addEventListener('click', loadDebts);

    // Filtro de situação
    document.getElementById('filterSituacao').addEventListener('change', handleFilterChange);

    // Modal de detalhes
    document.getElementById('closeDetailsModal').addEventListener('click', closeDetailsModal);

    // Fechar modais clicando no overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeFormModal();
                closeDetailsModal();
            }
        });
    });
}

// MODAL DE FORMULÁRIO
function openFormModal() {
    document.getElementById('formModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Previne scroll do body
}

function closeFormModal() {
    document.getElementById('formModal').classList.add('hidden');
    document.body.style.overflow = ''; // Restaura scroll

    // Limpa o formulário
    document.getElementById('debtForm').reset();
}

function closeDetailsModal() {
    document.getElementById('detailsModal').classList.add('hidden');
    document.body.style.overflow = '';
}

// TOAST DE NOTIFICAÇÕES
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const messageSpan = document.getElementById('toastMessage');

    // Define ícone baseado no tipo
    if (type === 'success') {
        icon.textContent = '✓';
        toast.className = 'toast toast-success';
    } else if (type === 'error') {
        icon.textContent = '✗';
        toast.className = 'toast toast-error';
    }

    messageSpan.textContent = message;
    toast.classList.remove('hidden');

    // Remove o toast após 4 segundos
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

// VALIDAÇÃO E MÁSCARAS
function maskCPF(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    e.target.value = value;
}

function maskCEP(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value;
}

function validateForm(formData) {
    const errors = [];

    // Validação de campos obrigatórios
    if (!formData.cliente.nome.trim()) {
        errors.push('Nome é obrigatório');
    }

    const cpfClean = formData.cliente.cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
        errors.push('CPF deve ter 11 dígitos');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.cliente.email)) {
        errors.push('E-mail inválido');
    }

    if (!formData.valor || formData.valor <= 0) {
        errors.push('Valor deve ser maior que zero');
    }

    if (!formData.descricao.trim()) {
        errors.push('Descrição é obrigatória');
    }

    if (!formData.situacao || !['Pendente', 'Pago'].includes(formData.situacao)) {
        errors.push('Situação inválida');
    }

    return errors;
}

// MANIPULAÇÃO DO FORMULÁRIO
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Coleta dados do formulário
    const formData = {
        cliente: {
            nome: form.nome.value,
            cpf: form.cpf.value,
            email: form.email.value,
            endereco: {
                cep: form.cep.value,
                numero: form.numero.value,
                complemento: form.complemento.value
            }
        },
        valor: parseFloat(form.valor.value),
        descricao: form.descricao.value,
        situacao: form.situacao.value,
        numeroProcesso: form.numeroProcesso.value
    };

    // Validação no cliente
    const errors = validateForm(formData);
    if (errors.length > 0) {
        showToast('Erros de validação: ' + errors.join(', '), 'error');
        return;
    }

    // Arquivo PDF
    const fileInput = form.comprovante;
    const file = fileInput.files[0] || null;

    // Validação de arquivo
    if (file) {
        if (file.type !== 'application/pdf') {
            showToast('Apenas arquivos PDF são permitidos', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('O arquivo deve ter no máximo 5MB', 'error');
            return;
        }
    }

    try {
        // Desabilita botão durante envio
        submitBtn.disabled = true;
        submitBtn.textContent = 'Cadastrando...';

        // Envia para API
        await API.createDebt(formData, file);

        // Mostra toast de sucesso
        showToast('Dívida cadastrada com sucesso!', 'success');

        // Fecha modal e limpa formulário
        closeFormModal();

        // Recarrega lista
        await loadDebts();

    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        showToast(error.message || 'Erro ao cadastrar dívida', 'error');
    } finally {
        // Reabilita botão
        submitBtn.disabled = false;
        submitBtn.textContent = 'Cadastrar Dívida';
    }
}

// CARREGAMENTO E EXIBIÇÃO DE DÍVIDAS
async function loadDebts() {
    const tbody = document.getElementById('debtsTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Carregando...</td></tr>';

    try {
        debts = await API.getAllDebts();
        renderDebts();
    } catch (error) {
        console.error('Erro ao carregar dívidas:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Erro ao carregar dívidas</td></tr>';
    }
}

function renderDebts() {
    const tbody = document.getElementById('debtsTableBody');

    // Aplica filtro
    let filteredDebts = debts;
    if (currentFilter) {
        filteredDebts = debts.filter(debt => debt.situacao === currentFilter);
    }

    if (filteredDebts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Nenhuma dívida encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = filteredDebts.map(debt => `
        <tr>
            <td>${escapeHtml(debt.cliente.nome)}</td>
            <td>${formatCPF(debt.cliente.cpf)}</td>
            <td>${formatCurrency(debt.valor)}</td>
            <td>${escapeHtml(debt.descricao.substring(0, 50))}${debt.descricao.length > 50 ? '...' : ''}</td>
            <td><span class="badge badge-${debt.situacao.toLowerCase()}">${debt.situacao}</span></td>
            <td>${formatDate(debt.createdAt)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-view" onclick="viewDebtDetails('${debt.id}')" title="Ver detalhes">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteDebt('${debt.id}')" title="Excluir">
                          <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function handleFilterChange(e) {
    currentFilter = e.target.value;
    renderDebts();
}

// VISUALIZAÇÃO DE DETALHES
function viewDebtDetails(id) {
    const debt = debts.find(d => d.id === id);
    if (!debt) {
        showToast('Dívida não encontrada', 'error');
        return;
    }

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="detail-group">
            <div class="detail-label">Cliente:</div>
            <div class="detail-value">${escapeHtml(debt.cliente.nome)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">CPF:</div>
            <div class="detail-value">${formatCPF(debt.cliente.cpf)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">E-mail:</div>
            <div class="detail-value">${escapeHtml(debt.cliente.email)}</div>
        </div>
        
        ${debt.cliente.endereco.cep ? `
        <div class="detail-group">
            <div class="detail-label">Endereço:</div>
            <div class="detail-value">
                CEP: ${debt.cliente.endereco.cep}<br>
                ${debt.cliente.endereco.numero ? `Nº ${debt.cliente.endereco.numero}` : ''}
                ${debt.cliente.endereco.complemento ? ` - ${escapeHtml(debt.cliente.endereco.complemento)}` : ''}
            </div>
        </div>
        ` : ''}
        
        <div class="detail-group">
            <div class="detail-label">Valor:</div>
            <div class="detail-value">${formatCurrency(debt.valor)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">Descrição:</div>
            <div class="detail-value">${escapeHtml(debt.descricao)}</div>
        </div>
        
        <div class="detail-group">
            <div class="detail-label">Situação:</div>
            <div class="detail-value">
                <span class="badge badge-${debt.situacao.toLowerCase()}">${debt.situacao}</span>
            </div>
        </div>
        
        ${debt.numeroProcesso ? `
        <div class="detail-group">
            <div class="detail-label">Número do Processo:</div>
            <div class="detail-value">${escapeHtml(debt.numeroProcesso)}</div>
        </div>
        ` : ''}
        
        ${debt.comprovantePath ? `
        <div class="detail-group">
            <div class="detail-label">Comprovante:</div>
            <div class="detail-value">
                <a href="${API.BASE_URL}${debt.comprovantePath}" target="_blank" class="btn btn-small">
                    Baixar PDF
                </a>
            </div>
        </div>
        ` : ''}
        
        <div class="detail-group">
            <div class="detail-label">Data de Cadastro:</div>
            <div class="detail-value">${formatDateTime(debt.createdAt)}</div>
        </div>
    `;

    showDetailsModal();
}

function showDetailsModal() {
    document.getElementById('detailsModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// EXCLUSÃO DE DÍVIDA
async function deleteDebt(id) {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const confirmed = confirm(
        `Tem certeza que deseja excluir a dívida de ${debt.cliente.nome}?\n\n` +
        `Valor: ${formatCurrency(debt.valor)}\n` +
        `Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
        await API.deleteDebt(id);
        showToast('Dívida excluída com sucesso!', 'success');
        await loadDebts();
    } catch (error) {
        console.error('Erro ao excluir:', error);
        showToast(error.message || 'Erro ao excluir dívida', 'error');
    }
}

// UTILITÁRIOS
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatCPF(cpf) {
    const clean = cpf.replace(/\D/g, '');
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function checkServerStatus() {
    const isOnline = await API.checkServerStatus();

    if (!isOnline) {
        const cacheInfo = Storage.getCacheInfo();
        if (cacheInfo.hasCache) {
            API.showConnectionStatus(
                `⚠ Servidor offline - Usando cache (${cacheInfo.count} registros)`,
                'warning'
            );
        } else {
            API.showConnectionStatus(
                '⚠ Servidor offline - Nenhum dado em cache',
                'error'
            );
        }
    }
}

// Torna funções disponíveis globalmente para onclick
window.viewDebtDetails = viewDebtDetails;
window.deleteDebt = deleteDebt;