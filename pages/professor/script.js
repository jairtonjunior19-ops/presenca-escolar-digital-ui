let professorLogado = null;
let alunosDaTurmaSelecionada = [];
const estadoPresenca = {};

document.addEventListener('DOMContentLoaded', () => {
    const sessao = obterSessao();
    if (!sessao || sessao.perfil !== 'professor') {
        window.location.replace('../../index.html');
        return;
    }

    professorLogado = obterProfessorPorId(sessao.id);
    if (!professorLogado) {
        sairDoSistemaProfessor();
        return;
    }

    document.getElementById('saudacao-professor').textContent = `Olá, ${professorLogado.nome}`;

    const hoje = new Date();
    document.getElementById('data-atual').textContent = 'Data: ' + hoje.toLocaleDateString('pt-BR');

    carregarEstatisticas();
    carregarSelectTurmas();
    carregarUltimasChamadas();
});

function sairDoSistemaProfessor() {
    encerrarSessao();
    window.location.replace('../../index.html');
}

function carregarEstatisticas() {
    const turmasIds = professorLogado.turmasIds || [];
    const totalAlunos = obterAlunos().filter(aluno => turmasIds.includes(aluno.turmaId)).length;
    const totalChamadas = obterPresencasDoProfessor(professorLogado.id).length;

    document.getElementById('valor-turmas').textContent = turmasIds.length;
    document.getElementById('valor-alunos').textContent = totalAlunos;
    document.getElementById('valor-chamadas').textContent = totalChamadas;
}

function carregarSelectTurmas() {
    const selectTurma = document.getElementById('select-turma');
    const turmasIds = professorLogado.turmasIds || [];
    const turmas = obterTurmas().filter(turma => turmasIds.includes(turma.id));

    if (turmas.length === 0) {
        selectTurma.innerHTML = '<option value="">Nenhuma turma atribuída a você</option>';
        renderizarAlunos();
        return;
    }

    selectTurma.innerHTML = '<option value="">Selecione a turma...</option>' +
        turmas.map(turma => `<option value="${turma.id}">${turma.nome}</option>`).join('');
}

function carregarAlunosDaTurma() {
    const turmaId = document.getElementById('select-turma').value;
    alunosDaTurmaSelecionada = turmaId ? obterAlunos().filter(aluno => aluno.turmaId === turmaId) : [];

    Object.keys(estadoPresenca).forEach(chave => delete estadoPresenca[chave]);
    renderizarAlunos();
}

function renderizarAlunos() {
    const corpoTabela = document.getElementById('linhas-alunos');
    const mensagemVazia = document.getElementById('mensagem-vazia-alunos');
    corpoTabela.innerHTML = '';

    if (alunosDaTurmaSelecionada.length === 0) {
        mensagemVazia.hidden = false;
        mensagemVazia.textContent = professorLogado.turmasIds && professorLogado.turmasIds.length > 0
            ? 'Selecione uma turma para carregar os alunos.'
            : 'Você ainda não possui turmas atribuídas. Fale com o gestor escolar.';
        return;
    }

    mensagemVazia.hidden = true;

    alunosDaTurmaSelecionada.forEach(aluno => {
        if (!estadoPresenca[aluno.id]) {
            estadoPresenca[aluno.id] = 'presente';
        }

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td style="font-weight: 600;">${aluno.nome}</td>
            <td style="color: var(--texto-secundario);">${aluno.matricula}</td>
            <td>
                <div class="alternador-presenca">
                    <button type="button" class="botao-alternar botao-presente ${estadoPresenca[aluno.id] === 'presente' ? 'ativo' : ''}"
                            onclick="marcarPresenca('${aluno.id}', 'presente', this)">P</button>
                    <button type="button" class="botao-alternar botao-falta ${estadoPresenca[aluno.id] === 'falta' ? 'ativo' : ''}"
                            onclick="marcarPresenca('${aluno.id}', 'falta', this)">F</button>
                </div>
            </td>
        `;
        corpoTabela.appendChild(linha);
    });
}

function marcarPresenca(alunoId, status, botaoClicado) {
    estadoPresenca[alunoId] = status;

    const container = botaoClicado.parentElement;
    container.querySelector('.botao-presente').classList.remove('ativo');
    container.querySelector('.botao-falta').classList.remove('ativo');
    botaoClicado.classList.add('ativo');
}

function salvarChamada() {
    const turmaId = document.getElementById('select-turma').value;
    const materia = document.getElementById('campo-materia').value.trim();
    const tipoAula = document.getElementById('select-tipo-aula').value;

    if (!turmaId) {
        alert('Selecione uma turma antes de enviar a chamada.');
        return;
    }

    if (alunosDaTurmaSelecionada.length === 0) {
        alert('Não há alunos cadastrados nesta turma.');
        return;
    }

    if (!materia) {
        alert('Informe a matéria da aula antes de enviar a chamada.');
        return;
    }

    const turma = obterTurmaPorId(turmaId);
    const registros = alunosDaTurmaSelecionada.map(aluno => ({
        alunoId: aluno.id,
        nome: aluno.nome,
        status: estadoPresenca[aluno.id] || 'presente'
    }));

    registrarPresenca({
        professorId: professorLogado.id,
        professorNome: professorLogado.nome,
        turmaId,
        turmaNome: turma ? turma.nome : 'Turma removida',
        materia,
        tipoAula,
        data: new Date().toLocaleDateString('pt-BR'),
        registros
    });

    alert('Chamada enviada com sucesso ao sistema!');
    document.getElementById('campo-materia').value = '';
    carregarEstatisticas();
    carregarUltimasChamadas();
}

function carregarUltimasChamadas() {
    const lista = document.getElementById('lista-ultimas-chamadas');
    const mensagemVazia = document.getElementById('mensagem-vazia-historico');
    const chamadas = obterPresencasDoProfessor(professorLogado.id).slice(0, 5);

    lista.innerHTML = '';

    if (chamadas.length === 0) {
        mensagemVazia.hidden = false;
        return;
    }

    mensagemVazia.hidden = true;

    chamadas.forEach(chamada => {
        const totalPresentes = chamada.registros.filter(registro => registro.status === 'presente').length;
        const percentual = Math.round((totalPresentes / chamada.registros.length) * 100);

        const item = document.createElement('li');
        item.className = 'item-historico';
        item.innerHTML = `
            <div class="info-historico">
                <h4>${chamada.materia} - ${chamada.turmaNome}</h4>
                <p>Frequência: ${percentual}% • ${chamada.data}</p>
            </div>
            <span class="selo-status">Concluída</span>
        `;
        lista.appendChild(item);
    });
}
