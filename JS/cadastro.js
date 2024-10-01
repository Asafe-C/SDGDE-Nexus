// Função para alternar a exibição dos campos do organizador
function toggleOrganizerFields() {
    const role = document.getElementById('role').value;
    const organizerFields = document.getElementById('organizer-fields');
    organizerFields.style.display = role === 'organizador' ? 'block' : 'none';
}

// Função para aplicar máscara no CNPJ
function maskCNPJ(cnpjField) {
    let cnpj = cnpjField.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Aplica a máscara se o CNPJ estiver no formato correto
    if (cnpj.length <= 14) {
        cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2') // Primeiro ponto
                   .replace(/(\d{3})(\d)/, '$1.$2') // Segundo ponto
                   .replace(/(\d{3})(\d)/, '$1/$2') // Barra
                   .replace(/(\d{4})(\d)/, '$1-$2'); // Hífen
    }

    cnpjField.value = cnpj; // Atualiza o valor do campo
}

// Validação de Email
function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex para validar email
    return regexEmail.test(email);
}

// Validação de Senha
function validarSenha(senha) {
    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/; // Regra de complexidade da senha
    return regexSenha.test(senha);
}

// Validação de CNPJ
function validarCNPJ(cnpj) {
    const regexCNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/; // Formato padrão de CNPJ
    return regexCNPJ.test(cnpj);
}

// Validação para verificar se o nome contém apenas uma palavra
function validarNome(nomePU) {
    const regexNome = /^\S+$/; // Regex que valida se o nome é uma única palavra sem espaços
    return regexNome.test(nomePU);
}

// Função para exibir mensagens de erro
function mostrarErro(mensagem) {
    alert(mensagem); // Exibe a mensagem de erro
}

// Processamento do envio do formulário
function handleSubmit(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Selecionando os campos do formulário
    const formData = {
        nomeP: document.getElementById('nomeP').value,
        nomeU: document.getElementById('nomeU').value,
        estado: document.getElementById('estado').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        company: document.getElementById('company').value,
        cnpj: document.getElementById('cnpj').value,
    };

    // Validações
    if (!validarNome(formData.nomeP)) {
        mostrarErro("O primeiro nome deve conter apenas uma palavra.");
        return;
    }

    if (!validarNome(formData.nomeU)) {
        mostrarErro("O último nome deve conter apenas uma palavra.");
        return;
    }

    if (!validarEmail(formData.email)) {
        mostrarErro("Por favor, insira um email válido.");
        return;
    }

    if (!validarSenha(formData.password)) {
        mostrarErro("A senha deve ter pelo menos 6 caracteres, uma letra maiúscula, uma letra minúscula e um número.");
        return;
    }

    if (formData.role === 'organizador') {
        if (!formData.cnpj) {
            mostrarErro("O campo CNPJ é obrigatório para organizadores.");
            return;
        }
        if (!validarCNPJ(formData.cnpj)) {
            mostrarErro("Por favor, insira um CNPJ válido no formato 00.000.000/0000-00.");
            return;
        }
    }

    // Armazenando os dados no localStorage
    localStorage.setItem('userNomeP', formData.nomeP);
    localStorage.setItem('userNomeU', formData.nomeU);
    localStorage.setItem('userEstado', formData.estado);
    localStorage.setItem('userLogin', formData.email);
    localStorage.setItem('userSenha', formData.password);
    localStorage.setItem('userRole', formData.role);

    if (formData.role === 'organizador') {
        localStorage.setItem('userEmpresa', formData.company);
        localStorage.setItem('userCNPJ', formData.cnpj);
    }

    alert("Formulário enviado com sucesso!"); // Mensagem de sucesso
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = "mainpage.html"; // Redireciona para a página de login
}