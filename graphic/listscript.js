const socket = io();

// Function to add a container for each user
function addContainer(username) {
    const containerList = document.getElementById('container-list');

    // Create new container div
    const newContainer = document.createElement('div');
    newContainer.className = 'container';

    // Create label
    const label = document.createElement('label');
    label.textContent = username;

    // Create button
    const button = document.createElement('button');
    button.textContent = 'Invite';

    // Append label and button to container
    newContainer.appendChild(label);
    newContainer.appendChild(button);

    // Append container to container list
    containerList.appendChild(newContainer);
}

// Function to clear the container list
function clearContainers() {
    const containerList = document.getElementById('container-list');
    containerList.innerHTML = '';
}

// Listen for online users update
socket.on('online users', (users) => {
    clearContainers();
    users.forEach(username => {
        addContainer(username);
    });
});

// Emit user login event when the page loads (for demo purposes, replace with actual username)
document.addEventListener('DOMContentLoaded', () => {
    const username = prompt('Enter your username:');
    socket.emit('user login', username);
});
