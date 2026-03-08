// URLs definition for local vs cloud
const LOCAL_API_URL = 'http://localhost:3000';
// Substituir a URL abaixo pela URL da API na nuvem (ex: Render, Railway) depois do deploy
const CLOUD_API_URL = 'https://mercadinho-api-exemplo.onrender.com';

const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

const API_URL = isLocalhost ? LOCAL_API_URL : CLOUD_API_URL;

// ==========================================
// MODO DEMONSTRAÇÃO GITHUB PAGES (FRONTEND-ONLY)
// ==========================================
// Ative isto para `true` para usar o sistema sem backend (Dados Fictícios Lidos do Navegador)
const USE_MOCK_DATA = true;

// Mock Database (Persistent in LocalStorage just for the Demo)
let mockProdutos = JSON.parse(localStorage.getItem('mockProdutos')) || [
    { id: 1, codigo: '001', nome: 'Arroz 5kg', categoria: 'Alimentos', preco: 25.90, estoque: 50 },
    { id: 2, codigo: '002', nome: 'Feijão 1kg', categoria: 'Alimentos', preco: 8.50, estoque: 30 },
    { id: 3, codigo: '003', nome: 'Detergente', categoria: 'Limpeza', preco: 2.50, estoque: 100 },
    { id: 4, codigo: '004', nome: 'Papel Higiênico', categoria: 'Limpeza', preco: 15.00, estoque: 5 } // Estoque baixo
];

let mockVendas = JSON.parse(localStorage.getItem('mockVendas')) || [];

function saveMockDb() {
    localStorage.setItem('mockProdutos', JSON.stringify(mockProdutos));
    localStorage.setItem('mockVendas', JSON.stringify(mockVendas));
}

async function fetchAPI(endpoint, options = {}) {
    if (USE_MOCK_DATA) {
        return handleMockRequest(endpoint, options);
    }

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Erro na requisição');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Interceptor Fake para simular o Backend inteiramente no Navegador
async function handleMockRequest(endpoint, options) {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));

    const method = options.method || 'GET';
    const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

    // Rota: /produtos
    if (endpoint.startsWith('/produtos')) {
        if (method === 'GET') {
            const idMatch = endpoint.match(/\/produtos\/(\d+)$/);
            if (idMatch) {
                const id = parseInt(idMatch[1]);
                const produto = mockProdutos.find(p => p.id === id);
                if (produto) return produto;
                throw new Error('Produto não encontrado');
            }
            return mockProdutos;
        }
        if (method === 'POST') {
            body.id = mockProdutos.length ? Math.max(...mockProdutos.map(p => p.id)) + 1 : 1;
            mockProdutos.push(body);
            saveMockDb();
            return { message: 'Produto cadastrado com sucesso', id: body.id };
        }
        if (method === 'PUT') {
            const id = parseInt(endpoint.split('/').pop());
            const index = mockProdutos.findIndex(p => p.id === id);
            if (index > -1) {
                mockProdutos[index] = { ...mockProdutos[index], ...body };
                saveMockDb();
                return { message: 'Produto atualizado' };
            }
            throw new Error('Produto não encontrado');
        }
        if (method === 'DELETE') {
            const id = parseInt(endpoint.split('/').pop());
            mockProdutos = mockProdutos.filter(p => p.id !== id);
            saveMockDb();
            return { message: 'Produto removido' };
        }
    }

    // Rota: /vendas
    if (endpoint === '/vendas' && method === 'GET') {
        return mockVendas;
    }

    if (endpoint === '/vendas' && method === 'POST') {
        body.id = mockVendas.length ? Math.max(...mockVendas.map(v => v.id)) + 1 : 1;
        body.data = new Date().toISOString();
        // Baixa o estoque
        if (body.itens) {
            body.itens.forEach(item => {
                const prod = mockProdutos.find(p => p.id == item.produto_id);
                if (prod) prod.estoque -= item.quantidade;
            });
        }
        body.total_itens = body.itens ? body.itens.length : 0;
        mockVendas.push(body);
        saveMockDb();
        return { message: 'Venda finalizada', vendaId: body.id };
    }

    // Rota: /vendas/relatorio
    if (endpoint === '/vendas/relatorio' && method === 'GET') {
        const total = mockVendas.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0);

        return {
            total_faturado: total > 0 ? total : 4325.50, // valor demo se estiver vazio
            produtos_mais_vendidos: [
                { nome: 'Arroz 5kg', total_vendido: 45 },
                { nome: 'Feijão 1kg', total_vendido: 20 },
                { nome: 'Detergente', total_vendido: 15 },
                { nome: 'Macarrão', total_vendido: 10 },
                { nome: 'Óleo', total_vendido: 8 }
            ],
            vendas_por_dia: [
                { data_venda: new Date(Date.now() - 6 * 86400000).toISOString(), total_dia: 450 },
                { data_venda: new Date(Date.now() - 5 * 86400000).toISOString(), total_dia: 380 },
                { data_venda: new Date(Date.now() - 4 * 86400000).toISOString(), total_dia: 520 },
                { data_venda: new Date(Date.now() - 3 * 86400000).toISOString(), total_dia: 310 },
                { data_venda: new Date(Date.now() - 2 * 86400000).toISOString(), total_dia: 690 },
                { data_venda: new Date(Date.now() - 1 * 86400000).toISOString(), total_dia: 580 },
                { data_venda: new Date().toISOString(), total_dia: parseInt(total) || 200 }
            ],
            previsao_vendas: 3200.00
        };
    }

    throw new Error('Rota mockada não encontrada: ' + endpoint);
}

function showToast(title, message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : (type === 'danger' ? 'bg-danger' : 'bg-primary');

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}
