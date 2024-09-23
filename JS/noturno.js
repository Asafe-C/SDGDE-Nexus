const toggleButton = document.getElementById('toggleButton');
const body = document.body;

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        toggleButton.textContent = 'Desativar Modo Noturno';
    } else {
        toggleButton.textContent = 'Ativar Modo Noturno';
    }
});