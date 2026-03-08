let modalProduto;

document.addEventListener('DOMContentLoaded', () => {
    modalProduto = new bootstrap.Modal(document.getElementById('produtoModal'));
    loadProdutos();
});

async function loadProdutos() {
    try {
        const produtos = await fetchAPI('/produtos');
        const tbody = document.getElementById('produtosTable');
        tbody.innerHTML = '';

        produtos.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.codigo}</td>
                <td>${p.nome}</td>
                <td>${p.categoria || '-'}</td>
                <td>R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</td>
                <td><span class="badge ${p.estoque <= 10 ? 'bg-danger' : 'bg-success'}">${p.estoque}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editProduto(${p.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduto(${p.id})"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showToast('Erro', 'Falha ao carregar produtos', 'danger');
    }
}

function prepareAdd() {
    document.getElementById('produtoForm').reset();
    document.getElementById('produtoId').value = '';
    document.getElementById('modalTitle').textContent = 'Novo Produto';
}

async function saveProduto() {
    const id = document.getElementById('produtoId').value;
    const produto = {
        codigo: document.getElementById('codigo').value,
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        preco: parseFloat(document.getElementById('preco').value),
        estoque: parseInt(document.getElementById('estoque').value)
    };

    if (!produto.codigo || !produto.nome || isNaN(produto.preco) || isNaN(produto.estoque)) {
        showToast('Aviso', 'Preencha os campos obrigatórios corretamente', 'warning');
        return;
    }

    try {
        if (id) {
            await fetchAPI(`/produtos/${id}`, { method: 'PUT', body: produto });
            showToast('Sucesso', 'Produto atualizado com sucesso');
        } else {
            await fetchAPI('/produtos', { method: 'POST', body: produto });
            showToast('Sucesso', 'Produto cadastrado com sucesso');
        }
        modalProduto.hide();
        loadProdutos();
    } catch (error) {
        showToast('Erro', error.message, 'danger');
    }
}

async function editProduto(id) {
    try {
        const produto = await fetchAPI(`/produtos/${id}`);
        document.getElementById('produtoId').value = produto.id;
        document.getElementById('codigo').value = produto.codigo;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('categoria').value = produto.categoria || '';
        document.getElementById('preco').value = produto.preco;
        document.getElementById('estoque').value = produto.estoque;

        document.getElementById('modalTitle').textContent = 'Editar Produto';
        modalProduto.show();
    } catch (error) {
        showToast('Erro', 'Não foi possível carregar o produto', 'danger');
    }
}

async function deleteProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
        await fetchAPI(`/produtos/${id}`, { method: 'DELETE' });
        showToast('Sucesso', 'Produto excluído com sucesso');
        loadProdutos();
    } catch (error) {
        showToast('Erro', error.message, 'danger');
    }
}
