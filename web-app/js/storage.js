// web-app/js/storage.js
// Gerenciamento de LocalStorage (cache local)

const Storage = {
    STORAGE_KEY: 'debts_cache',
    CACHE_TIMESTAMP_KEY: 'debts_cache_timestamp',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutos em milissegundos

    /**
     * Salva as dívidas no localStorage
     * @param {Array} debts - Array de dívidas
     */
    saveDebts(debts) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(debts));
            localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
            console.log('✅ Dados salvos no cache local');
        } catch (error) {
            console.error('❌ Erro ao salvar no localStorage:', error);
        }
    },

    /**
     * Recupera as dívidas do localStorage
     * @returns {Array|null} Array de dívidas ou null
     */
    getDebts() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) {
                console.log('ℹ️ Nenhum dado no cache');
                return null;
            }

            const debts = JSON.parse(data);
            console.log(`✅ ${debts.length} dívidas recuperadas do cache`);
            return debts;
        } catch (error) {
            console.error('❌ Erro ao recuperar do localStorage:', error);
            return null;
        }
    },

    /**
     * Verifica se o cache está válido (não expirou)
     * @returns {boolean}
     */
    isCacheValid() {
        try {
            const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
            if (!timestamp) return false;

            const age = Date.now() - parseInt(timestamp);
            const isValid = age < this.CACHE_DURATION;
            
            if (!isValid) {
                console.log('⚠️ Cache expirado');
            }
            
            return isValid;
        } catch (error) {
            console.error('❌ Erro ao verificar validade do cache:', error);
            return false;
        }
    },

    /**
     * Limpa o cache
     */
    clearCache() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
            console.log('🗑️ Cache limpo');
        } catch (error) {
            console.error('❌ Erro ao limpar cache:', error);
        }
    },

    /**
     * Obtém estatísticas do cache
     * @returns {Object}
     */
    getCacheInfo() {
        const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
        const debts = this.getDebts();
        
        return {
            hasCache: !!debts,
            count: debts ? debts.length : 0,
            isValid: this.isCacheValid(),
            lastUpdate: timestamp ? new Date(parseInt(timestamp)).toLocaleString('pt-BR') : 'Nunca',
            age: timestamp ? Date.now() - parseInt(timestamp) : null
        };
    }
};

// Torna disponível globalmente
window.Storage = Storage;