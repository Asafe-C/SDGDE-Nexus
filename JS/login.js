// Selecionando elementos do DOM
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const loginForm = document.querySelector("#loginForm");

// Função para validar o email usando regex
function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex para validação de email
    return regexEmail.test(email);
}

// Função para validar a senha
function validarSenha(senha) {
    return senha.length >= 6; // Exemplo: senha deve ter pelo menos 6 caracteres
}

// Função para fazer o login
async function logar() {
    try {
        const storedEmail = localStorage.getItem('userLogin');
        const storedPassword = localStorage.getItem('userSenha');

        // Validar email e senha
        if (!validarEmail(emailInput.value)) {
            throw new Error("Email inválido! Por favor, insira um email válido.");
        }

        if (!validarSenha(passwordInput.value)) {
            throw new Error("Senha inválida! A senha deve ter pelo menos 6 caracteres.");
        }

        // Simulando uma operação assíncrona (ex: consulta a um servidor)
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simula atraso

        // Verificando se as credenciais são válidas
        if (emailInput.value === storedEmail && passwordInput.value === storedPassword) {
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = "mainpage.html"; // Redireciona para a página inicial
        } else {
            throw new Error("Email ou senha incorretos.");
        }
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}

// Adicionando um listener para o evento de submit do formulário
loginForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Evita o envio padrão do formulário
    logar(); // Chama a função de login
});