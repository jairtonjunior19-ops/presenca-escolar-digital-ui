document.addEventListener('DOMContentLoaded', () => {
    if (!protegerRotaGestor()) return;

    renderizarMenuGestor('professores');
    renderizarTabelaProfessores();

    document.getElementById('formulario-professor').addEventListener('submit', tratarEnvioFormularioProfessor);
});

function renderizarTabelaProfessores() {
    const corpoTabela = document.getElementById('linhas-professores');
    const mensagemVazia = document.getElementById('mensagem-vazia-professores');
    const avisoSemTurmas = document.getElementById('aviso-sem-turmas');
    const professores = obterProfessores();
    const turmas = obterTurmas();

    avisoSemTurmas.hidden = turmas.length > 0;
    corpoTabela.innerHTML = '';

    if (professores.length === 0) {
        mensagemVazia.hidden = false;
        return;
    }

    mensagemVazia.hidden = true;

    professores.forEach(professor => {
        const turmasDoProfessor = turmas.filter(turma => (professor.turmasIds || []).includes(turma.id));
        const etiquetasTurmas = turmasDoProfessor.length > 0
            ? turmasDoProfessor.map(turma => `<span class="etiqueta-turma">${turma.nome}</span>`).join('')
            : '<span class="etiqueta-vazia">Nenhuma turma atribuída</span>';

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td style="font-weight: 600;">${professor.nome}</td>
            <td>${professor.email}</td>
            <td>${etiquetasTurmas}</td>
            <td>
                <button class="botao-icone editar" onclick="abrirModalProfessor('${professor.id}')">Editar</button>
                <button class="botao-icone excluir" onclick="excluirProfessor('${professor.id}')">Excluir</button>
            </td>
        `;
        corpoTabela.appendChild(linha);
    });
}

function abrirModalProfessor(idProfessor) {
    const modal = document.getElementById('modal-professor');
    const titulo = document.getElementById('titulo-modal-professor');
    const erroFormulario = document.getElementById('erro-formulario-professor');
    const turmas = obterTurmas();

    erroFormulario.hidden = true;
    document.getElementById('id-professor-edicao').value = idProfessor || '';

    const professor = idProfessor ? obterProfessorPorId(idProfessor) : null;
    titulo.textContent = professor ? 'Editar Professor' : 'Novo Professor';

    document.getElementById('nome-professor').value = professor ? professor.nome : '';
    document.getElementById('email-professor').value = professor ? professor.email : '';
    document.getElementById('senha-professor').value = professor ? professor.senha : '';

    const listaCheckbox = document.getElementById('lista-turmas-checkbox');
    if (turmas.length === 0) {
        listaCheckbox.innerHTML = '<p class="etiqueta-vazia">Nenhuma turma cadastrada ainda.</p>';
    } else {
        const turmasIdsProfessor = professor ? (professor.turmasIds || []) : [];
        listaCheckbox.innerHTML = turmas.map(turma => `
            <label class="item-checkbox">
                <input type="checkbox" value="${turma.id}" ${turmasIdsProfessor.includes(turma.id) ? 'checked' : ''}>
                ${turma.nome}
            </label>
        `).join('');
    }

    modal.hidden = false;
}

function fecharModalProfessor() {
    document.getElementById('modal-professor').hidden = true;
    document.getElementById('formulario-professor').reset();
}

function tratarEnvioFormularioProfessor(evento) {
    evento.preventDefault();

    const idProfessor = document.getElementById('id-professor-edicao').value;
    const nome = document.getElementById('nome-professor').value.trim();
    const email = document.getElementById('email-professor').value.trim();
    const senha = document.getElementById('senha-professor').value;
    const turmasIds = Array.from(document.querySelectorAll('#lista-turmas-checkbox input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    const erroFormulario = document.getElementById('erro-formulario-professor');
    erroFormulario.hidden = true;

    try {
        if (idProfessor) {
            atualizarProfessor(idProfessor, { nome, email, senha, turmasIds });
        } else {
            adicionarProfessor({ nome, email, senha, turmasIds });
        }
        fecharModalProfessor();
        renderizarTabelaProfessores();
    } catch (erro) {
        erroFormulario.textContent = erro.message;
        erroFormulario.hidden = false;
    }
}

function excluirProfessor(idProfessor) {
    const professor = obterProfessorPorId(idProfessor);
    if (!professor) return;

    const confirmou = confirm(`Deseja realmente excluir o professor "${professor.nome}"?`);
    if (!confirmou) return;

    removerProfessor(idProfessor);
    renderizarTabelaProfessores();
}
