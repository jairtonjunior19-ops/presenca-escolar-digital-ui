document.addEventListener('DOMContentLoaded', () => {
    if (!protegerRotaGestor()) return;

    renderizarMenuGestor('presencas');
    carregarFiltros();
    renderizarListaPresencas();
});

function carregarFiltros() {
    const presencas = obterPresencas();

    const professoresUnicos = [];
    const turmasUnicas = [];

    presencas.forEach(presenca => {
        if (!professoresUnicos.some(item => item.id === presenca.professorId)) {
            professoresUnicos.push({ id: presenca.professorId, nome: presenca.professorNome });
        }
        if (!turmasUnicas.some(item => item.id === presenca.turmaId)) {
            turmasUnicas.push({ id: presenca.turmaId, nome: presenca.turmaNome });
        }
    });

    const filtroProfessor = document.getElementById('filtro-professor');
    filtroProfessor.innerHTML = '<option value="">Todos os professores</option>' +
        professoresUnicos.map(professor => `<option value="${professor.id}">${professor.nome}</option>`).join('');

    const filtroTurma = document.getElementById('filtro-turma');
    filtroTurma.innerHTML = '<option value="">Todas as turmas</option>' +
        turmasUnicas.map(turma => `<option value="${turma.id}">${turma.nome}</option>`).join('');
}

function renderizarListaPresencas() {
    const container = document.getElementById('lista-registros-presenca');
    const mensagemVazia = document.getElementById('mensagem-vazia-presencas');
    const professorSelecionado = document.getElementById('filtro-professor').value;
    const turmaSelecionada = document.getElementById('filtro-turma').value;

    let presencas = obterPresencas();

    if (professorSelecionado) {
        presencas = presencas.filter(presenca => presenca.professorId === professorSelecionado);
    }
    if (turmaSelecionada) {
        presencas = presencas.filter(presenca => presenca.turmaId === turmaSelecionada);
    }

    container.innerHTML = '';

    if (presencas.length === 0) {
        mensagemVazia.hidden = false;
        return;
    }

    mensagemVazia.hidden = true;

    presencas.forEach(presenca => {
        const totalPresentes = presenca.registros.filter(registro => registro.status === 'presente').length;
        const totalFaltas = presenca.registros.filter(registro => registro.status === 'falta').length;

        const linhasAlunos = presenca.registros.map(registro => `
            <div class="linha-aluno-registro">
                <span>${registro.nome}</span>
                <span class="${registro.status === 'presente' ? 'selo-presente' : 'selo-falta'}">
                    ${registro.status === 'presente' ? 'Presente' : 'Falta'}
                </span>
            </div>
        `).join('');

        const detalhes = document.createElement('details');
        detalhes.className = 'registro-presenca';
        detalhes.innerHTML = `
            <summary>
                <div class="info-registro">
                    <h4>${presenca.materia} • ${presenca.turmaNome}</h4>
                    <p>${presenca.professorNome} • ${presenca.tipoAula} • ${presenca.data}</p>
                </div>
                <div class="resumo-registro">
                    <span class="selo-presente">${totalPresentes} presentes</span>
                    <span class="selo-falta">${totalFaltas} faltas</span>
                </div>
            </summary>
            <div class="detalhe-registro">${linhasAlunos}</div>
        `;
        container.appendChild(detalhes);
    });
}
