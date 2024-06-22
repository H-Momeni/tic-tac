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

const inviteModal = document.getElementById('inviteModal');
const inviteText = document.getElementById('inviteText');
const acceptButton = document.getElementById('acceptButton');
const rejectButton = document.getElementById('rejectButton');

// Listen for game invites
socket.on('game invite', ({ fromUsername, fromSocketId }) => {
    console.log('Received game invite from:', fromUsername, 'with socket ID:', fromSocketId);
    inviteText.textContent = `${fromUsername} has invited you to play. Do you accept?`;
    inviteModal.style.display = 'block';

    acceptButton.onclick = () => {
        inviteModal.style.display = 'none';
        socket.emit('accept invite', fromSocketId);
        localStorage.setItem('peerSocketId', fromSocketId);
      
    };

    rejectButton.onclick = () => {
        inviteModal.style.display = 'none';
        socket.emit('reject invite', fromSocketId);
    };


});

function redirectToPage(username,groupId) {

    localStorage.setItem('username', username);
    localStorage.setItem('groupId', groupId);

    socket.emit('user login game page',{username,groupId});
    window.location.href = `/tic`;
}

// Listen for redirection to the game
socket.on('redirect to game', ({username,groupId}) => {
    //alert(`${username1}`)
    redirectToPage(username,groupId);
});



// Listen for invite acceptance
socket.on('invite accepted', ({ toUsername, toSocketId }) => {
    alert(`${toUsername} accepted your game invite.`);
    localStorage.setItem('peerSocketId', toSocketId);
    // redirectToPage();

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
