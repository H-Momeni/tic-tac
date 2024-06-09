document.addEventListener('DOMContentLoaded', (event) => {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');

    loginButton.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        alert(`Login clicked! Username: ${username}, Password: ${password}`);
        // Add your login logic here
    });

    signupButton.addEventListener('click', () => {
        window.location.href = 'signup.html';
    });
});
