let modalDetalhes;

document.addEventListener('DOMContentLoaded', () => {
    modalDetalhes = new bootstrap.Modal(document.getElementById('detalhesModal'));
    loadRelatorios();
    loadHistorico();
});

async function loadRelatorios() {
    try {
        const relatorio = await fetchAPI('/vendas/relatorio');

        const ul = document.getElementById('topProdutosList');
        ul.innerHTML = '';

        if (!relatorio.produtos_mais_vendidos || relatorio.produtos_mais_vendidos.length === 0) {
            ul.innerHTML = '<li class="list-group-item text-muted">Nenhuma venda registrada ainda.</li>';
        } else {
            relatorio.produtos_mais_vendidos.forEach((p, index) => {
                ul.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${index + 1}. ${p.nome}
                        <span class="badge bg-primary rounded-pill">${p.total_vendido} unid.</span>
                    </li>
                `;
            });
        }
    } catch (error) {
        showToast('Erro', 'Falha ao carregar relatórios', 'danger');
    }
}

async function loadHistorico() {
    try {
        const vendas = await fetchAPI('/vendas');
        const tbody = document.getElementById('historicoVendasTable');
        tbody.innerHTML = '';

        vendas.forEach(v => {
            const data = new Date(v.data).toLocaleString('pt-BR');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${v.id}</td>
                <td>${data}</td>
                <td>${v.total_itens}</td>
                <td>R$ ${parseFloat(v.total).toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn btn-sm btn-info text-white" onclick="viewDetalhes(${v.id})">
                        <i class="bi bi-eye"></i> Detalhes
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showToast('Erro', 'Falha ao carregar histórico', 'danger');
    }
}

async function viewDetalhes(id) {
    try {
        const dados = await fetchAPI(`/vendas/${id}`);

        document.getElementById('detalheVendaId').textContent = dados.venda.id;
        document.getElementById('detalheData').textContent = new Date(dados.venda.data).toLocaleString('pt-BR');
        document.getElementById('detalheTotal').textContent = parseFloat(dados.venda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const tbody = document.getElementById('detalheItensTable');
        tbody.innerHTML = '';

        dados.itens.forEach(item => {
            const subtotal = item.quantidade * item.preco_unitario;
            tbody.innerHTML += `
                <tr>
                    <td>${item.codigo} - ${item.nome}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${parseFloat(item.preco_unitario).toFixed(2).replace('.', ',')}</td>
                    <td>R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
                </tr>
            `;
        });

        modalDetalhes.show();
    } catch (error) {
        showToast('Erro', 'Não foi possível carregar os detalhes da venda', 'danger');
    }
}
