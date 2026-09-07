document.addEventListener('DOMContentLoaded', () => {
    if (!protegerRotaGestor()) return;

    renderizarMenuGestor('alunos');
    renderizarTabelaAlunos();

    document.getElementById('formulario-aluno').addEventListener('submit', tratarEnvioFormularioAluno);
});

function renderizarTabelaAlunos() {
    const corpoTabela = document.getElementById('linhas-alunos-gestor');
    const mensagemVazia = document.getElementById('mensagem-vazia-alunos-gestor');
    const alunos = obterAlunos();

    corpoTabela.innerHTML = '';

    if (alunos.length === 0) {
        mensagemVazia.hidden = false;
        return;
    }

    mensagemVazia.hidden = true;

    alunos.forEach(aluno => {
        const turma = aluno.turmaId ? obterTurmaPorId(aluno.turmaId) : null;
        const etiquetaTurma = turma
            ? `<span class="etiqueta-turma">${turma.nome}</span>`
            : '<span class="etiqueta-vazia">Sem turma</span>';

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td style="font-weight: 600;">${aluno.nome}</td>
            <td>${aluno.matricula}</td>
            <td>${etiquetaTurma}</td>
            <td>
                <button class="botao-icone editar" onclick="abrirModalAluno('${aluno.id}')">Editar</button>
                <button class="botao-icone excluir" onclick="excluirAluno('${aluno.id}')">Excluir</button>
            </td>
        `;
        corpoTabela.appendChild(linha);
    });
}

function abrirModalAluno(idAluno) {
    const modal = document.getElementById('modal-aluno');
    const titulo = document.getElementById('titulo-modal-aluno');
    const erroFormulario = document.getElementById('erro-formulario-aluno');

    erroFormulario.hidden = true;
    document.getElementById('id-aluno-edicao').value = idAluno || '';

    const aluno = idAluno ? obterAlunoPorId(idAluno) : null;
    titulo.textContent = aluno ? 'Editar Aluno' : 'Novo Aluno';

    document.getElementById('nome-aluno').value = aluno ? aluno.nome : '';
    document.getElementById('matricula-aluno').value = aluno ? aluno.matricula : '';

    modal.hidden = false;
}

function fecharModalAluno() {
    document.getElementById('modal-aluno').hidden = true;
    document.getElementById('formulario-aluno').reset();
}

function tratarEnvioFormularioAluno(evento) {
    evento.preventDefault();

    const idAluno = document.getElementById('id-aluno-edicao').value;
    const nome = document.getElementById('nome-aluno').value.trim();
    const matricula = document.getElementById('matricula-aluno').value.trim();

    const erroFormulario = document.getElementById('erro-formulario-aluno');
    erroFormulario.hidden = true;

    try {
        if (idAluno) {
            atualizarAluno(idAluno, { nome, matricula });
        } else {
            adicionarAluno({ nome, matricula });
        }
        fecharModalAluno();
        renderizarTabelaAlunos();
    } catch (erro) {
        erroFormulario.textContent = erro.message;
        erroFormulario.hidden = false;
    }
}

function excluirAluno(idAluno) {
    const aluno = obterAlunoPorId(idAluno);
    if (!aluno) return;

    const confirmou = confirm(`Deseja realmente excluir o aluno "${aluno.nome}"?`);
    if (!confirmou) return;

    removerAluno(idAluno);
    renderizarTabelaAlunos();
}
