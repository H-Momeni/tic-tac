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

    button.addEventListener('click', () => {
        socket.emit('send invite', username);
        //alert('invite successful!');

    });

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

// Listen for game invites
socket.on('game invite', ({ fromUsername, fromSocketId }) => {
    const accept = confirm(`${fromUsername} has invited you to play. Do you accept?`);
    if (accept) {
        socket.emit('accept invite', fromSocketId);
    } else {
        socket.emit('reject invite', fromSocketId);
    }
});

// Listen for invite acceptance
socket.on('invite accepted', ({ toUsername, toSocketId }) => {
    alert(`${toUsername} accepted your game invite.`);
    // Handle game start logic here
});

// Listen for invite rejection
socket.on('invite rejected', ({ toUsername }) => {
    alert(`${toUsername} rejected your game invite.`);
});


// Emit user login event when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (username) {
        socket.emit('user login', username);
    } else {
        alert('No username found. Please log in again.');
        window.location.href = '/'; // Redirect to login page if no username is found
    }
});

// Emit user login event when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//     // Fetch username from the server-side session or prompt for demo purposes
//     fetch('/api/get-username')
//         .then(response => response.json())
//         .then(data => {
//             socket.emit('user login', data.username);
//         })
//         .catch(err => console.error('Failed to get username:', err));
// });

// Emit user login event when the page loads (for demo purposes, replace with actual username)



// document.addEventListener('DOMContentLoaded', () => {
//     //const username = prompt('Enter your username:');
    
//     socket.emit('user login', username1);
// });
