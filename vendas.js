let carrinho = [];
let produtosDisp = [];

document.addEventListener('DOMContentLoaded', loadProdutosDisp);

async function loadProdutosDisp() {
    try {
        produtosDisp = await fetchAPI('/produtos');

        const select = document.getElementById('produtoSelect');
        const tbody = document.getElementById('listaProdutosTable');

        produtosDisp.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.codigo} - ${p.nome} (R$ ${parseFloat(p.preco).toFixed(2)})`;
            if (p.estoque <= 0) option.disabled = true;
            select.appendChild(option);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.nome}</td>
                <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
                <td><span class="badge ${p.estoque <= 10 ? 'bg-danger' : 'bg-success'}">${p.estoque}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adicionarDireto(${p.id})" ${p.estoque <= 0 ? 'disabled' : ''}>
                        <i class="bi bi-cart-plus"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showToast('Erro', 'Falha ao carregar produtos', 'danger');
    }
}

function adicionarDireto(id) {
    document.getElementById('produtoSelect').value = id;
    document.getElementById('quantidadeInput').value = 1;
    adicionarAoCarrinho();
}

function adicionarAoCarrinho() {
    const select = document.getElementById('produtoSelect');
    const produtoId = select.value;
    const quantidade = parseInt(document.getElementById('quantidadeInput').value);

    if (!produtoId || quantidade <= 0) {
        showToast('Aviso', 'Selecione um produto e uma quantidade válida', 'warning');
        return;
    }

    const produto = produtosDisp.find(p => p.id == produtoId);

    const itemCarrinho = carrinho.find(i => i.produto_id == produtoId);
    const qtdAtual = itemCarrinho ? itemCarrinho.quantidade : 0;

    if (qtdAtual + quantidade > produto.estoque) {
        showToast('Aviso', `Estoque insuficiente. Apenas ${produto.estoque} disponíveis.`, 'warning');
        return;
    }

    if (itemCarrinho) {
        itemCarrinho.quantidade += quantidade;
        itemCarrinho.subtotal = itemCarrinho.quantidade * itemCarrinho.preco_unitario;
    } else {
        carrinho.push({
            produto_id: produto.id,
            nome: produto.nome,
            quantidade: quantidade,
            preco_unitario: parseFloat(produto.preco),
            subtotal: quantidade * parseFloat(produto.preco)
        });
    }

    atualizarCarrinho();

    select.value = '';
    document.getElementById('quantidadeInput').value = 1;
}

function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const tbody = document.getElementById('carrinhoTable');
    tbody.innerHTML = '';

    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.subtotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.subtotal.toFixed(2).replace('.', ',')}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="removerItem(${index})"><i class="bi bi-x"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('valorTotal').textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('btnFinalizar').disabled = carrinho.length === 0;
}

async function finalizarVenda() {
    if (carrinho.length === 0) return;

    document.getElementById('btnFinalizar').disabled = true;

    try {
        const total = carrinho.reduce((sum, item) => sum + item.subtotal, 0);

        const payload = {
            total: total,
            itens: carrinho.map(i => ({
                produto_id: i.produto_id,
                quantidade: i.quantidade,
                preco_unitario: i.preco_unitario
            }))
        };

        await fetchAPI('/vendas', { method: 'POST', body: payload });

        showToast('Sucesso', 'Venda finalizada com sucesso!');
        carrinho = [];
        atualizarCarrinho();

        document.getElementById('produtoSelect').innerHTML = '<option value="">Selecione um produto...</option>';
        document.getElementById('listaProdutosTable').innerHTML = '';
        setTimeout(loadProdutosDisp, 500);

    } catch (error) {
        showToast('Erro', error.message, 'danger');
        document.getElementById('btnFinalizar').disabled = false;
    }
}
