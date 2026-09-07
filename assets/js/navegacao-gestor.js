const ITENS_MENU_GESTOR = [
    { chave: 'dashboard', rotulo: 'Visão Geral', href: 'dashboard.html' },
    { chave: 'professores', rotulo: 'Professores', href: 'professores.html' },
    { chave: 'alunos', rotulo: 'Alunos', href: 'alunos.html' },
    { chave: 'turmas', rotulo: 'Turmas', href: 'turmas.html' },
    { chave: 'presencas', rotulo: 'Registros de Presença', href: 'presencas.html' }
];

function protegerRotaGestor() {
    const sessao = obterSessao();
    if (!sessao || sessao.perfil !== 'gestor') {
        window.location.replace('../../index.html');
        return null;
    }
    return sessao;
}

function renderizarMenuGestor(paginaAtiva) {
    const sessao = obterSessao();
    const elementoMenu = document.getElementById('menu-gestor');
    if (!elementoMenu) return;

    const linksHtml = ITENS_MENU_GESTOR.map(item => `
        <a href="${item.href}" class="link-menu ${item.chave === paginaAtiva ? 'ativo' : ''}">${item.rotulo}</a>
    `).join('');

    elementoMenu.innerHTML = `
        <header class="barra-navegacao" id="barra-navegacao-gestor">
            <div class="marca-navegacao">
                <span class="selo-logo">PD</span>
                <h2>Presença Digital</h2>
            </div>
            <button class="botao-hamburguer" id="botao-hamburguer" onclick="alternarMenuMobile()" aria-label="Abrir menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
            <nav class="navegacao-links">${linksHtml}</nav>
            <div class="perfil-usuario">
                <span class="nome-sessao">${sessao ? sessao.nome : 'Gestor'}</span>
                <button class="botao-sair" onclick="sairDoSistema()">Sair</button>
            </div>
        </header>
    `;
}

function alternarMenuMobile() {
    const barra = document.getElementById('barra-navegacao-gestor');
    const botaoHamburguer = document.getElementById('botao-hamburguer');
    const menuAberto = barra.classList.toggle('menu-aberto');
    botaoHamburguer.setAttribute('aria-expanded', menuAberto ? 'true' : 'false');
}

function sairDoSistema() {
    encerrarSessao();
    window.location.replace('../../index.html');
}
