document.addEventListener('DOMContentLoaded', () => {
    const sessaoAtiva = obterSessao();
    if (sessaoAtiva) {
        redirecionarParaPainel(sessaoAtiva.perfil);
        return;
    }

    const botaoAlternarSenha = document.getElementById('botao-alternar-senha');
    const formularioLogin = document.getElementById('formulario-login');
    const linkEsqueciSenha = document.getElementById('link-esqueci-senha');

    botaoAlternarSenha.addEventListener('click', alternarVisibilidadeSenha);
    formularioLogin.addEventListener('submit', tratarEnvioLogin);

    linkEsqueciSenha.addEventListener('click', (evento) => {
        evento.preventDefault();
        alert('Funcionalidade de recuperação de senha a ser integrada ao back-end.');
    });
});

function alternarVisibilidadeSenha() {
    const campoSenha = document.getElementById('campo-senha');
    const botaoAlternarSenha = document.getElementById('botao-alternar-senha');

    if (campoSenha.type === 'password') {
        campoSenha.type = 'text';
        botaoAlternarSenha.textContent = 'Ocultar';
    } else {
        campoSenha.type = 'password';
        botaoAlternarSenha.textContent = 'Mostrar';
    }
}

function exibirAlerta(tipo, texto) {
    const caixaAlerta = document.getElementById('mensagem-alerta');
    caixaAlerta.className = `alerta alerta-${tipo}`;
    caixaAlerta.textContent = texto;
    caixaAlerta.style.display = 'block';
}

function redirecionarParaPainel(perfil) {
    if (perfil === 'gestor') {
        window.location.href = './pages/gestor/dashboard.html';
    } else {
        window.location.href = './pages/professor/index.html';
    }
}

function tratarEnvioLogin(evento) {
    evento.preventDefault();

    const perfil = document.getElementById('select-perfil').value;
    const email = document.getElementById('campo-email').value.trim();
    const senha = document.getElementById('campo-senha').value;
    const caixaAlerta = document.getElementById('mensagem-alerta');
    const botaoEntrar = document.getElementById('botao-entrar');

    caixaAlerta.style.display = 'none';
    botaoEntrar.disabled = true;
    botaoEntrar.textContent = 'AUTENTICANDO...';

    setTimeout(() => {
        const usuario = autenticarUsuario(perfil, email, senha);

        if (!usuario) {
            exibirAlerta('erro', 'E-mail, senha ou perfil incorretos.');
            botaoEntrar.disabled = false;
            botaoEntrar.textContent = 'ENTRAR NO SISTEMA';
            return;
        }

        salvarSessao(usuario);
        exibirAlerta('sucesso', `Bem-vindo(a), ${usuario.nome}! Redirecionando...`);

        setTimeout(() => {
            redirecionarParaPainel(usuario.perfil);
        }, 700);
    }, 500);
}
