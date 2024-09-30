document.addEventListener("DOMContentLoaded", () => {
    try {
        const role = localStorage.getItem('userRole');
        const formOrganizador = document.querySelector('#createEventForm');
        const opcParticipante = document.querySelector('#opcParticipante')

        if (role === 'organizador') {
            formOrganizador.style.display = 'block';
        }

        if (role === 'participante'){
            opcParticipante.style.display = 'block'
        }

        const btnCriarEvento = document.getElementById('btnCriarEvento');
        btnCriarEvento.addEventListener('click', criarEvento);
        loadEvents();

        // Adicionar eventos para os checkboxes de filtro
        const filtros = document.querySelectorAll('.btn-check');
        filtros.forEach(filtro => {
            filtro.addEventListener('change', loadEvents);
        });
    } catch (error) {
        console.error("Erro ao inicializar a aplicação:", error);
        alert("Ocorreu um erro ao carregar a aplicação. Por favor, tente novamente mais tarde.");
    }
});

let inscritos = JSON.parse(localStorage.getItem('inscritos')) || [];
let eventosCriados = JSON.parse(localStorage.getItem('eventosCriados')) || [];

/**
 * Função assíncrona para carregar os eventos
 */
async function loadEvents() {
    try {
        const userEstado = localStorage.getItem('userEstado');
        const eventosDiv = $('#eventos');
        const eventosProximosDiv = $('#eventosProximos');
        const eventosInscritosDiv = $('#eventosInscritos');

        eventosDiv.empty();
        eventosProximosDiv.empty();
        eventosInscritosDiv.empty();

        // Captura os filtros selecionados
        const filtrosSelecionados = Array.from(document.querySelectorAll('.btn-check:checked')).map(checkbox => checkbox.value);

        // Iterar sobre eventos criados e adicioná-los de acordo com os filtros
        for (const evento of eventosCriados) {
            // Modificação aqui para lidar com múltiplas categorias
            if (filtrosSelecionados.length === 0 || filtrosSelecionados.some(filtro => evento.category.split(', ').includes(filtro))) {
                await adicionarEvento(evento, eventosDiv, eventosProximosDiv, userEstado);
            }
        }

        updateInscritos();
    } catch (error) {
        console.error("Erro ao carregar os eventos:", error);
        alert("Ocorreu um erro ao carregar os eventos. Por favor, tente novamente mais tarde.");
    }
}

/**
 * Função assíncrona para criar um novo evento
 */
async function criarEvento() {
    try {
        const titulo = document.getElementById('titulo').value.trim();
        const inicio = document.getElementById('inicio').value;
        const fim = document.getElementById('fim').value;
        const regiao = document.getElementById('regiao').value.trim();
        const descricaoBreve = document.getElementById('descricaoBreve').value.trim();
        const descricao = document.getElementById('descricao').value.trim();
        const bannerEV = document.getElementById('bannerEV').files[0];

        // Validações com regex
        const tituloRegex = /^[a-zA-Z0-9\s]{5,100}$/;
        const descricaoBreveRegex = /^.{10,300}$/;
        const descricaoRegex = /^.{10,1000}$/;

        if (!tituloRegex.test(titulo)) {
            alert("O título deve ter entre 5 e 100 caracteres alfanuméricos.");
            return;
        }

        if (!descricaoBreveRegex.test(descricaoBreve)) {
            alert("A descrição breve deve ter entre 10 e 300 caracteres.");
            return;
        }

        if (!descricaoRegex.test(descricao)) {
            alert("A descrição deve ter entre 10 e 1000 caracteres.");
            return;
        }

        if (!inicio || !fim) {
            alert("Por favor, preencha as datas de início e fim do evento.");
            return;
        }

        if (new Date(inicio) >= new Date(fim)) {
            alert("A data de início deve ser anterior à data de fim.");
            return;
        }

        if (!regiao) {
            alert("Por favor, selecione uma região.");
            return;
        }

        const categoriasSelecionadas = Array.from(document.querySelectorAll('.btn-check:checked')).map(checkbox => checkbox.value);
        if (categoriasSelecionadas.length === 0) {
            alert("Por favor, selecione pelo menos uma categoria.");
            return;
        }
        const category = categoriasSelecionadas.join(', ');

        let imageDataUrl = '';
        if (bannerEV) {
            imageDataUrl = await readFileAsync(bannerEV);
        } else {
            alert("Por favor, faça o upload de um banner para o evento.");
            return;
        }

        const novoEvento = {
            id: 'evento' + Date.now(),
            name: titulo,
            start_date: inicio,
            end_date: fim,
            region: regiao,
            image: imageDataUrl,
            shortDescription: descricaoBreve,
            description: descricao,
            organizer: localStorage.getItem('userEmpresa'),
            category: category
        };

        eventosCriados.push(novoEvento);
        localStorage.setItem('eventosCriados', JSON.stringify(eventosCriados));
        await adicionarEvento(novoEvento, $('#eventos'), $('#eventosProximos'), localStorage.getItem('userEstado'));
        updateInscritos();

        // Limpa o formulário após o envio
        document.getElementById('titulo').value = '';
        document.getElementById('inicio').value = '';
        document.getElementById('fim').value = '';
        document.getElementById('regiao').value = '';
        document.getElementById('descricaoBreve').value = '';
        document.getElementById('descricao').value = '';
        document.getElementById('bannerEV').value = '';
        document.querySelectorAll('.btn-check').forEach(checkbox => checkbox.checked = false); 
        loadEvents();
        alert("Evento criado com sucesso!");
        location.reload();
    } catch (error) {
        console.error("Erro ao criar o evento:", error);
        alert("Ocorreu um erro ao criar o evento. Por favor, tente novamente.");
    }
}

/**
 * Função para ler um arquivo de forma assíncrona usando Promises
 * @param {File} file - Arquivo a ser lido
 * @returns {Promise<string>} - Retorna uma Promise que resolve para a URL do arquivo
 */
function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
        reader.readAsDataURL(file);
    });
}

/**
 * Função assíncrona para adicionar um evento ao DOM
 * @param {Object} evento - Objeto do evento
 * @param {jQuery} eventosDiv - Div onde os eventos são listados
 * @param {jQuery} eventosProximosDiv - Div para eventos próximos
 * @param {string} userEstado - Estado do usuário para filtrar eventos próximos
 */
async function adicionarEvento(evento, eventosDiv, eventosProximosDiv, userEstado) {
    try {
        const card = `
            <div class="col evento" data-categoria="${evento.category}">
                <div class="card" style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#${evento.id}Modal">
                    <img src="${evento.image}" class="card-img-top" alt="${evento.name}">
                    <div class="card-body">
                        <h5 class="card-title">${evento.name}</h5>
                        <div class="text-card">
                            <p class="card-text">${evento.shortDescription}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        eventosDiv.append(card);

        // Adicionar o modal
        const modal = `
            <div class="modal fade" id="${evento.id}Modal" tabindex="-1" aria-labelledby="${evento.id}Label" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="${evento.id}Label">${evento.name}</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <img src="${evento.image}" alt="Banner" class="img-fluid">
                            <div class="info-modal">
                                <p>Datas: <br> ${evento.start_date} até ${evento.end_date}</p>
                                <p>Região: <br> ${evento.region}</p>
                                <p>Realização: <br> ${evento.organizer}</p>
                            </div>
                            <p class="desc-ev">${evento.description}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success" onclick="inscreverEvento('${evento.id}')" style="display: ${localStorage.getItem('userRole') === 'participante' ? 'inline-block' : 'none'};">Inscrever-se</button>
                            <button type="button" class="btn btn-danger" onclick="deletarEvento('${evento.id}')" style="display: ${localStorage.getItem('userRole') === 'organizador' ? 'inline-block' : 'none'};">Deletar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('body').append(modal);

        // Adicionar eventos próximos se a região do evento for igual à do usuário
        if (evento.region === userEstado) {
            eventosProximosDiv.append(card);
        }
    } catch (error) {
        console.error(`Erro ao adicionar o evento ${evento.id}:`, error);
    }
}

/**
 * Função para deletar um evento
 * @param {string} eventId - ID do evento a ser deletado
 */
function deletarEvento(eventId) {
    try {
        eventosCriados = eventosCriados.filter(evento => evento.id !== eventId);
        localStorage.setItem('eventosCriados', JSON.stringify(eventosCriados));
        loadEvents();
        alert("Evento deletado com sucesso!");
    } catch (error) {
        console.error(`Erro ao deletar o evento ${eventId}:`, error);
        alert("Ocorreu um erro ao deletar o evento. Por favor, tente novamente.");
    }
}

/**
 * Função para inscrever-se em um evento
 * @param {string} eventId - ID do evento
 */
function inscreverEvento(eventId) {
    try {
        if (!inscritos.includes(eventId)) {
            inscritos.push(eventId);
            localStorage.setItem('inscritos', JSON.stringify(inscritos));
            alert("Inscrição realizada com sucesso!");
            updateInscritos();
        } else {
            alert("Você já está inscrito neste evento!");
        }
    } catch (error) {
        console.error(`Erro ao inscrever-se no evento ${eventId}:`, error);
        alert("Ocorreu um erro ao se inscrever no evento. Por favor, tente novamente.");
    }
}

/**
 * Função para atualizar a lista de eventos inscritos
 */
function updateInscritos() {
    try {
        inscritos = JSON.parse(localStorage.getItem('inscritos')) || [];
        const eventosInscritosDiv = $('#eventosInscritos');
        eventosInscritosDiv.empty();

        if (inscritos.length === 0) {
            eventosInscritosDiv.append('<p></p>');
            return;
        }

        inscritos.forEach(eventId => {
            const evento = eventosCriados.find(event => event.id === eventId);
            if (evento) {
                const cardInscrito = `
                    <div class="col">
                        <div class="card" style="cursor: pointer;">
                            <img src="${evento.image}" class="card-img-top" alt="${evento.name}">
                            <div class="card-body">
                                <h5 class="card-title">${evento.name}</h5>
                                <div class="text-card">
                                    <p class="card-text">${evento.shortDescription || ""}</p>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button class="btn btn-danger btn-sm" onclick="desinscreverEvento('${evento.id}')">Desinscrever-se</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                eventosInscritosDiv.append(cardInscrito);
            }
        });
    } catch (error) {
        console.error("Erro ao atualizar eventos inscritos:", error);
        alert("Ocorreu um erro ao atualizar os eventos inscritos. Por favor, tente novamente.");
    }
}

/**
 * Função para desinscrever-se de um evento
 * @param {string} eventId - ID do evento
 */
function desinscreverEvento(eventId) {
    try {
        inscritos = inscritos.filter(id => id !== eventId);
        localStorage.setItem('inscritos', JSON.stringify(inscritos));
        alert("Desinscrição realizada com sucesso!");
        updateInscritos();
    } catch (error) {
        console.error(`Erro ao desinscrever-se do evento ${eventId}:`, error);
        alert("Ocorreu um erro ao desinscrever-se do evento. Por favor, tente novamente.");
    }
}

/**
 * Função para filtrar eventos com base nas categorias selecionadas
 */
function filtrarEventos() {
    try {
        const filtros = document.querySelectorAll('.btn-check');
        const eventos = document.querySelectorAll('#eventos .evento');

        const categoriasSelecionadas = Array.from(filtros)
            .filter(filtro => filtro.checked)
            .map(filtro => filtro.value);

        eventos.forEach(evento => {
            const categoriasEvento = evento.getAttribute('data-categoria').split(',').map(cat => cat.trim());
            const temCategoriaSelecionada = categoriasSelecionadas.some(categoria => categoriasEvento.includes(categoria));

            if (categoriasSelecionadas.length === 0 || temCategoriaSelecionada) {
                evento.style.display = 'block';
            } else {
                evento.style.display = 'none';
            }
        });
    } catch (error) {
        console.error("Erro ao filtrar os eventos:", error);
        alert("Ocorreu um erro ao filtrar os eventos. Por favor, tente novamente.");
    }
}

// Adiciona event listeners às caixas de seleção para filtrar eventos
document.querySelectorAll('.btn-check').forEach(filtro => {
    filtro.addEventListener('change', filtrarEventos);
});
