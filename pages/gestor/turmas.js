document.addEventListener('DOMContentLoaded', () => {
    if (!protegerRotaGestor()) return;

    renderizarMenuGestor('turmas');
    renderizarTabelaTurmas();

    document.getElementById('formulario-turma').addEventListener('submit', tratarEnvioFormularioTurma);
});

function renderizarTabelaTurmas() {
    const corpoTabela = document.getElementById('linhas-turmas');
    const mensagemVazia = document.getElementById('mensagem-vazia-turmas');
    const turmas = obterTurmas();

    corpoTabela.innerHTML = '';

    if (turmas.length === 0) {
        mensagemVazia.hidden = false;
        return;
    }

    mensagemVazia.hidden = true;

    turmas.forEach(turma => {
        const totalAlunos = obterAlunosDaTurma(turma.id).length;

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td style="font-weight: 600;">${turma.nome}</td>
            <td>${totalAlunos} aluno(s)</td>
            <td>
                <button class="botao-icone editar" onclick="abrirModalTurma('${turma.id}')">Editar</button>
                <button class="botao-icone excluir" onclick="excluirTurma('${turma.id}')">Excluir</button>
            </td>
        `;
        corpoTabela.appendChild(linha);
    });
}

function abrirModalTurma(idTurma) {
    const modal = document.getElementById('modal-turma');
    const titulo = document.getElementById('titulo-modal-turma');
    const erroFormulario = document.getElementById('erro-formulario-turma');
    const todosAlunos = obterAlunos();

    erroFormulario.hidden = true;
    document.getElementById('id-turma-edicao').value = idTurma || '';

    const turma = idTurma ? obterTurmaPorId(idTurma) : null;
    titulo.textContent = turma ? 'Editar Turma' : 'Nova Turma';
    document.getElementById('nome-turma').value = turma ? turma.nome : '';

    const listaCheckbox = document.getElementById('lista-alunos-checkbox');
    if (todosAlunos.length === 0) {
        listaCheckbox.innerHTML = '<p class="etiqueta-vazia">Nenhum aluno cadastrado ainda.</p>';
    } else {
        const alunosDaTurmaIds = turma ? obterAlunosDaTurma(turma.id).map(aluno => aluno.id) : [];
        listaCheckbox.innerHTML = todosAlunos.map(aluno => `
            <label class="item-checkbox">
                <input type="checkbox" value="${aluno.id}" ${alunosDaTurmaIds.includes(aluno.id) ? 'checked' : ''}>
                ${aluno.nome}${aluno.turmaId && aluno.turmaId !== (turma ? turma.id : null) ? ' <span class="etiqueta-vazia">(outra turma)</span>' : ''}
            </label>
        `).join('');
    }

    modal.hidden = false;
}

function fecharModalTurma() {
    document.getElementById('modal-turma').hidden = true;
    document.getElementById('formulario-turma').reset();
}

function tratarEnvioFormularioTurma(evento) {
    evento.preventDefault();

    const idTurma = document.getElementById('id-turma-edicao').value;
    const nome = document.getElementById('nome-turma').value.trim();
    const alunosIds = Array.from(document.querySelectorAll('#lista-alunos-checkbox input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    const erroFormulario = document.getElementById('erro-formulario-turma');
    erroFormulario.hidden = true;

    try {
        if (idTurma) {
            atualizarTurma(idTurma, { nome, alunosIds });
        } else {
            adicionarTurma({ nome, alunosIds });
        }
        fecharModalTurma();
        renderizarTabelaTurmas();
    } catch (erro) {
        erroFormulario.textContent = erro.message;
        erroFormulario.hidden = false;
    }
}

function excluirTurma(idTurma) {
    const turma = obterTurmaPorId(idTurma);
    if (!turma) return;

    const confirmou = confirm(`Deseja realmente excluir a turma "${turma.nome}"? Os alunos vinculados ficarão sem turma.`);
    if (!confirmou) return;

    removerTurma(idTurma);
    renderizarTabelaTurmas();
}
