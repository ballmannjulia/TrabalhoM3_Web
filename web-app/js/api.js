const API = {
    BASE_URL: 'http://localhost:3000',
    isOnline: true,

    /**
     * Mostra status de conexão na interface
     * @param {string} message - Mensagem a exibir
     * @param {string} type - Tipo: 'info', 'success', 'error', 'warning'
     */
    showConnectionStatus(message, type = 'info') {
        const statusDiv = document.getElementById('connectionStatus');
        const messageSpan = document.getElementById('statusMessage');
        
        if (statusDiv && messageSpan) {
            statusDiv.className = `alert alert-${type}`;
            messageSpan.textContent = message;
            statusDiv.classList.remove('hidden');

            // Remove a mensagem após 5 segundos
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 5000);
        }
    },

    /**
     * GET - Buscar todas as dívidas
     * @returns {Promise<Array>}
     */
    async getAllDebts() {
        try {
            const response = await fetch(`${this.BASE_URL}/debts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const debts = await response.json();
            
            // Salva no cache
            Storage.saveDebts(debts);
            
            this.isOnline = true;
            this.showConnectionStatus('✓ Conectado ao servidor', 'success');
            
            return debts;

        } catch (error) {
            console.error('Erro ao buscar dívidas:', error);
            this.isOnline = false;
            this.showConnectionStatus('⚠ Servidor offline - usando cache local', 'warning');
            
            // Tenta usar o cache
            const cachedDebts = Storage.getDebts();
            if (cachedDebts) {
                console.log(' Usando dados do cache');
                return cachedDebts;
            }
            
            console.warn(' Nenhum dado em cache disponível');
            return [];
        }
    },

    /**
     * POST - Criar nova dívida
     * @param {Object} debtData - Dados da dívida
     * @param {File|null} file - Arquivo PDF opcional
     * @returns {Promise<Object>}
     */
    async createDebt(debtData, file = null) {
        try {
            // Cria FormData para enviar arquivo
            const formData = new FormData();
            formData.append('data', JSON.stringify(debtData));
            
            if (file) {
                formData.append('comprovante', file);
                console.log('📎 Arquivo anexado:', file.name);
            }

            const response = await fetch(`${this.BASE_URL}/debts`, {
                method: 'POST',
                body: formData
                // Não define Content-Type, o browser faz automaticamente com FormData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors ? errorData.errors.join(', ') : 'Erro ao criar dívida');
            }

            const newDebt = await response.json();
            
            // NÃO mostra status aqui, será tratado no toast
            return newDebt;

        } catch (error) {
            console.error('❌ Erro ao criar dívida:', error);
            throw error;
        }
    },

    /**
     * DELETE - Excluir dívida
     * @param {string} id - ID da dívida
     * @returns {Promise<Object>}
     */
    async deleteDebt(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/debts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao excluir dívida');
            }

            const result = await response.json();
            
            // NÃO mostra status aqui, será tratado no toast
            return result;

        } catch (error) {
            console.error('❌ Erro ao excluir dívida:', error);
            throw error;
        }
    },

    /**
     * Verifica se o servidor está online
     * @returns {Promise<boolean>}
     */
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.BASE_URL}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            this.isOnline = response.ok;
            return response.ok;
        } catch (error) {
            this.isOnline = false;
            return false;
        }
    }
};

// Torna disponível globalmente
window.API = API;