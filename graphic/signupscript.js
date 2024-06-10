document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();

    const signupButton = document.getElementById('signupButton');
    const backButton = document.getElementById('backButton');

    signupButton.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.status === 201) {
                alert(`Signup successful! Connected to socket ID: ${socket.id}`);
                socket.emit('user signup', { username });
            } else {
                alert('Signup failed! Please try again.');
            }
        } catch (err) {
            console.error('Error during signup:', err);
            alert('Signup failed! Server error.');
        }
    });

    backButton.addEventListener('click', () => {
        window.location.href = '/';
    });
});
