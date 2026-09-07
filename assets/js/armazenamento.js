const CHAVES_ARMAZENAMENTO = {
    usuarios: 'pd_usuarios',
    alunos: 'pd_alunos',
    turmas: 'pd_turmas',
    presencas: 'pd_presencas',
    sessao: 'pd_sessao'
};

function lerLista(chave) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function inicializarBancoLocal() {
    if (!localStorage.getItem(CHAVES_ARMAZENAMENTO.usuarios)) {
        const gestorPadrao = {
            id: gerarId(),
            perfil: 'gestor',
            nome: 'Gestor Geral',
            email: 'gestor@uapi.edu.br',
            senha: 'gestor123'
        };
        salvarLista(CHAVES_ARMAZENAMENTO.usuarios, [gestorPadrao]);
    }
    if (!localStorage.getItem(CHAVES_ARMAZENAMENTO.alunos)) {
        salvarLista(CHAVES_ARMAZENAMENTO.alunos, []);
    }
    if (!localStorage.getItem(CHAVES_ARMAZENAMENTO.turmas)) {
        salvarLista(CHAVES_ARMAZENAMENTO.turmas, []);
    }
    if (!localStorage.getItem(CHAVES_ARMAZENAMENTO.presencas)) {
        salvarLista(CHAVES_ARMAZENAMENTO.presencas, []);
    }
}

inicializarBancoLocal();

function obterUsuarios() {
    return lerLista(CHAVES_ARMAZENAMENTO.usuarios);
}

function obterProfessores() {
    return obterUsuarios().filter(usuario => usuario.perfil === 'professor');
}

function obterProfessorPorId(id) {
    return obterProfessores().find(professor => professor.id === id) || null;
}

function autenticarUsuario(perfil, email, senha) {
    const usuarios = obterUsuarios();
    return usuarios.find(usuario =>
        usuario.perfil === perfil &&
        usuario.email.toLowerCase() === email.toLowerCase() &&
        usuario.senha === senha
    ) || null;
}

function emailJaCadastrado(email, idIgnorado) {
    return obterUsuarios().some(usuario =>
        usuario.email.toLowerCase() === email.toLowerCase() && usuario.id !== idIgnorado
    );
}

function adicionarProfessor(dados) {
    if (emailJaCadastrado(dados.email)) {
        throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }
    const usuarios = obterUsuarios();
    const professor = {
        id: gerarId(),
        perfil: 'professor',
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        turmasIds: dados.turmasIds || []
    };
    usuarios.push(professor);
    salvarLista(CHAVES_ARMAZENAMENTO.usuarios, usuarios);
    return professor;
}

function atualizarProfessor(id, dados) {
    if (dados.email && emailJaCadastrado(dados.email, id)) {
        throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }
    const usuarios = obterUsuarios();
    const indice = usuarios.findIndex(usuario => usuario.id === id && usuario.perfil === 'professor');
    if (indice === -1) return null;
    usuarios[indice] = { ...usuarios[indice], ...dados, id, perfil: 'professor' };
    salvarLista(CHAVES_ARMAZENAMENTO.usuarios, usuarios);
    return usuarios[indice];
}

function removerProfessor(id) {
    const usuarios = obterUsuarios().filter(usuario => !(usuario.id === id && usuario.perfil === 'professor'));
    salvarLista(CHAVES_ARMAZENAMENTO.usuarios, usuarios);
}

function obterAlunos() {
    return lerLista(CHAVES_ARMAZENAMENTO.alunos);
}

function obterAlunoPorId(id) {
    return obterAlunos().find(aluno => aluno.id === id) || null;
}

function matriculaJaCadastrada(matricula, idIgnorado) {
    return obterAlunos().some(aluno => aluno.matricula === matricula && aluno.id !== idIgnorado);
}

function adicionarAluno(dados) {
    if (matriculaJaCadastrada(dados.matricula)) {
        throw new Error('Já existe um aluno cadastrado com esta matrícula.');
    }
    const alunos = obterAlunos();
    const aluno = {
        id: gerarId(),
        nome: dados.nome,
        matricula: dados.matricula,
        turmaId: null
    };
    alunos.push(aluno);
    salvarLista(CHAVES_ARMAZENAMENTO.alunos, alunos);
    return aluno;
}

function atualizarAluno(id, dados) {
    if (dados.matricula && matriculaJaCadastrada(dados.matricula, id)) {
        throw new Error('Já existe um aluno cadastrado com esta matrícula.');
    }
    const alunos = obterAlunos();
    const indice = alunos.findIndex(aluno => aluno.id === id);
    if (indice === -1) return null;
    alunos[indice] = { ...alunos[indice], ...dados, id };
    salvarLista(CHAVES_ARMAZENAMENTO.alunos, alunos);
    return alunos[indice];
}

function removerAluno(id) {
    const alunos = obterAlunos().filter(aluno => aluno.id !== id);
    salvarLista(CHAVES_ARMAZENAMENTO.alunos, alunos);
}

function obterTurmas() {
    return lerLista(CHAVES_ARMAZENAMENTO.turmas);
}

function obterTurmaPorId(id) {
    return obterTurmas().find(turma => turma.id === id) || null;
}

function sincronizarTurmaNosAlunos(turmaId, alunosIds) {
    const alunos = obterAlunos().map(aluno => {
        if (alunosIds.includes(aluno.id)) {
            return { ...aluno, turmaId };
        }
        if (aluno.turmaId === turmaId) {
            return { ...aluno, turmaId: null };
        }
        return aluno;
    });
    salvarLista(CHAVES_ARMAZENAMENTO.alunos, alunos);
}

function obterAlunosDaTurma(turmaId) {
    return obterAlunos().filter(aluno => aluno.turmaId === turmaId);
}

function adicionarTurma(dados) {
    const turmas = obterTurmas();
    const turma = {
        id: gerarId(),
        nome: dados.nome
    };
    turmas.push(turma);
    salvarLista(CHAVES_ARMAZENAMENTO.turmas, turmas);
    sincronizarTurmaNosAlunos(turma.id, dados.alunosIds || []);
    return turma;
}

function atualizarTurma(id, dados) {
    const turmas = obterTurmas();
    const indice = turmas.findIndex(turma => turma.id === id);
    if (indice === -1) return null;
    turmas[indice] = { ...turmas[indice], nome: dados.nome !== undefined ? dados.nome : turmas[indice].nome, id };
    salvarLista(CHAVES_ARMAZENAMENTO.turmas, turmas);
    if (dados.alunosIds !== undefined) {
        sincronizarTurmaNosAlunos(id, dados.alunosIds);
    }
    return turmas[indice];
}

function removerTurma(id) {
    const turmas = obterTurmas().filter(turma => turma.id !== id);
    salvarLista(CHAVES_ARMAZENAMENTO.turmas, turmas);

    const alunos = obterAlunos().map(aluno => aluno.turmaId === id ? { ...aluno, turmaId: null } : aluno);
    salvarLista(CHAVES_ARMAZENAMENTO.alunos, alunos);

    const usuarios = obterUsuarios().map(usuario => {
        if (usuario.perfil === 'professor' && usuario.turmasIds && usuario.turmasIds.includes(id)) {
            return { ...usuario, turmasIds: usuario.turmasIds.filter(turmaId => turmaId !== id) };
        }
        return usuario;
    });
    salvarLista(CHAVES_ARMAZENAMENTO.usuarios, usuarios);
}

function obterPresencas() {
    return lerLista(CHAVES_ARMAZENAMENTO.presencas);
}

function obterPresencasDoProfessor(professorId) {
    return obterPresencas().filter(presenca => presenca.professorId === professorId);
}

function registrarPresenca(dados) {
    const presencas = obterPresencas();
    const presenca = {
        id: gerarId(),
        professorId: dados.professorId,
        professorNome: dados.professorNome,
        turmaId: dados.turmaId,
        turmaNome: dados.turmaNome,
        materia: dados.materia,
        tipoAula: dados.tipoAula,
        data: dados.data,
        registros: dados.registros,
        criadoEm: new Date().toISOString()
    };
    presencas.unshift(presenca);
    salvarLista(CHAVES_ARMAZENAMENTO.presencas, presencas);
    return presenca;
}

function salvarSessao(usuario) {
    localStorage.setItem(CHAVES_ARMAZENAMENTO.sessao, JSON.stringify({
        id: usuario.id,
        perfil: usuario.perfil,
        nome: usuario.nome,
        email: usuario.email
    }));
}

function obterSessao() {
    const dados = localStorage.getItem(CHAVES_ARMAZENAMENTO.sessao);
    return dados ? JSON.parse(dados) : null;
}

function encerrarSessao() {
    localStorage.removeItem(CHAVES_ARMAZENAMENTO.sessao);
}
