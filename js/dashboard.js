document.addEventListener('DOMContentLoaded', loadDashboard);

let vendasChartInstance = null;
let produtosChartInstance = null;

async function loadDashboard() {
    try {
        const produtos = await fetchAPI('/produtos');
        const relatorio = await fetchAPI('/vendas/relatorio');

        document.getElementById('totalFaturado').textContent =
            parseFloat(relatorio.total_faturado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const previsao = parseFloat(relatorio.previsao_vendas || 0);
        document.getElementById('previsaoVendas').textContent =
            previsao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        document.getElementById('totalProdutos').textContent = produtos.length;

        const estoqueBaixo = produtos.filter(p => p.estoque <= 10);
        document.getElementById('estoqueBaixoCount').textContent = estoqueBaixo.length;

        const tbody = document.getElementById('estoqueBaixoTable');
        tbody.innerHTML = '';

        if (estoqueBaixo.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Estoque regular</td></tr>';
        } else {
            estoqueBaixo.forEach(p => {
                tbody.innerHTML += `
                    <tr class="table-warning">
                        <td>${p.codigo}</td>
                        <td>${p.nome}</td>
                        <td class="text-danger fw-bold">${p.estoque}</td>
                    </tr>
                `;
            });
        }

        renderizarGraficos(relatorio);
    } catch (error) {
        showToast('Erro', 'Não foi possível carregar o dashboard', 'danger');
    }
}

function renderizarGraficos(relatorio) {
    if (relatorio.vendas_por_dia && relatorio.vendas_por_dia.length > 0) {
        const lblVendas = relatorio.vendas_por_dia.map(v => {
            const dateObj = new Date(v.data_venda);
            return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
        });
        const dataVendas = relatorio.vendas_por_dia.map(v => Number(v.total_dia));

        const ctxVendas = document.getElementById('vendasChart').getContext('2d');
        if (vendasChartInstance) vendasChartInstance.destroy();
        vendasChartInstance = new Chart(ctxVendas, {
            type: 'bar',
            data: {
                labels: lblVendas,
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: dataVendas,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    if (relatorio.produtos_mais_vendidos && relatorio.produtos_mais_vendidos.length > 0) {
        const lblProdutos = relatorio.produtos_mais_vendidos.map(p => p.nome);
        const dataProdutos = relatorio.produtos_mais_vendidos.map(p => Number(p.total_vendido));

        const bgColors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
        ];

        const ctxProdutos = document.getElementById('produtosChart').getContext('2d');
        if (produtosChartInstance) produtosChartInstance.destroy();
        produtosChartInstance = new Chart(ctxProdutos, {
            type: 'doughnut', // using doughnut for a nicer look
            data: {
                labels: lblProdutos,
                datasets: [{
                    data: dataProdutos,
                    backgroundColor: bgColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
}
