document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');

    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.status === 200) {
                alert('Login successful!');
                socket.emit('user login', { username });
                window.location.href = '/list'; // Redirect to user list page
            } else {
                alert('Invalid credentials. Please try again.');
            }
        } catch (err) {
            console.error('Error during login:', err);
            alert('Login failed! Server error.');
        }
    });

    signupButton.addEventListener('click', () => {
        window.location.href = '/signup';
    });
});
