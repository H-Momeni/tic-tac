document.addEventListener('DOMContentLoaded', (event) => {
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

            if (response.ok) {
                alert('Signup successful!');
                window.location.href = '/';
            } else {
                const error = await response.text();
                alert('Signup failed: ' + error);
            }
        } catch (err) {
            console.error('Error:', err);
            alert('An error occurred while signing up.');
        }
    });

    backButton.addEventListener('click', () => {
        window.location.href = '/'; // Adjust the path if necessary
    });
});
