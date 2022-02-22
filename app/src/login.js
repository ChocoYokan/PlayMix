const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (event) => {
    const form = document.forms['login'];
    const id = form.elements['id'].value;
    const password = form.elements['password'].value;
    window.electronAPI.authAccount(id, password);
    event.preventDefault();
});