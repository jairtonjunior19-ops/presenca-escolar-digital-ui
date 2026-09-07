document.addEventListener('DOMContentLoaded', () => {
    if (!protegerRotaGestor()) return;

    renderizarMenuGestor('dashboard');
    carregarEstatisticasGerais();
    carregarUltimosRegistros();
});

function carregarEstatisticasGerais() {
    document.getElementById('valor-total-professores').textContent = obterProfessores().length;
    document.getElementById('valor-total-alunos').textContent = obterAlunos().length;
    document.getElementById('valor-total-turmas').textContent = obterTurmas().length;
    document.getElementById('valor-total-presencas').textContent = obterPresencas().length;
}

function carregarUltimosRegistros() {
    const corpoTabela = document.getElementById('linhas-ultimos-registros');
    const mensagemVazia = document.getElementById('mensagem-vazia-registros');
    const registros = obterPresencas().slice(0, 8);

    corpoTabela.innerHTML = '';

    if (registros.length === 0) {
        mensagemVazia.hidden = false;
        return;
    }

    mensagemVazia.hidden = true;

    registros.forEach(registro => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${registro.data}</td>
            <td>${registro.professorNome}</td>
            <td>${registro.turmaNome}</td>
            <td>${registro.materia}</td>
        `;
        corpoTabela.appendChild(linha);
    });
}
