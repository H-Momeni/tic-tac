document.addEventListener('DOMContentLoaded', (event) => {
    const signupButton = document.getElementById('signupButton');
    const backButton = document.getElementById('backButton');

    signupButton.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        alert(`Signup clicked! Username: ${username}, Password: ${password}`);
        // Add your signup logic here
    });

    backButton.addEventListener('click', () => {
        window.location.href = 'login.html'; // Adjust the path if necessary
    });
});
