let containerCount = 1;

function addContainer() {
    const containerList = document.getElementById('container-list');

    // Create new container div
    const newContainer = document.createElement('div');
    newContainer.className = 'container';

    // Create label
    const label = document.createElement('label');
    label.textContent = `User ${containerCount}`;

    // Create button
    const button = document.createElement('button');
    button.textContent = 'Invite';

    // Append label and button to container
    newContainer.appendChild(label);
    newContainer.appendChild(button);

    // Append container to container list
    containerList.appendChild(newContainer);

    containerCount++;
}

// Add initial container
addContainer();

// Add a new container every 5 seconds
setInterval(addContainer, 500);
