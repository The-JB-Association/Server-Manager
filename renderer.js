const addButton = document.getElementById('add-server-button');
const serverTabs = document.getElementById('server-tabs');
const serverDetails = document.getElementById('server-details');
const noServerSelected = document.getElementById('no-server-selected');
const serverNameDisplay = document.getElementById('server-name-display');
const serverPathDisplay = document.getElementById('server-path-display');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const removeButton = document.getElementById('remove-button');
const outputArea = document.getElementById('output-area');

let currentServers = [];
let activeConsoleId = null;

async function loadSavedAndRenderServers(savedServers) {
	currentServers = savedServers;
	renderServerTabs(currentServers);
	updateMainView();
}

function renderServerTabs(servers) {
	serverTabs.innerHTML = '';
	if (servers.length === 0) {
		const welcomeTabButton = document.createElement('button');
		welcomeTabButton.textContent = 'Welcome';
		welcomeTabButton.classList.add('modern-button', 'server-tab-button', 'active');
		welcomeTabButton.disabled = true;
		serverTabs.appendChild(welcomeTabButton);

		activeConsoleId = null;
		updateMainView();
	} else {
		servers.forEach(server => {
			const tabButton = document.createElement('button');
			tabButton.textContent = server.name;
			tabButton.dataset.id = server.id;
			tabButton.classList.add('modern-button', 'server-tab-button');
			tabButton.classList.toggle('active', server.id === activeConsoleId);

			const statusIndicator = document.createElement('span');
			statusIndicator.classList.add('status-indicator', server.status === 'running' ? 'status-running' : 'status-stopped');
			tabButton.prepend(statusIndicator);

			tabButton.addEventListener('click', () => {
				activeConsoleId = server.id;
				console.log('Tab Clicked, activeConsoleId:', activeConsoleId);
				renderServerTabs(currentServers);
				updateMainView();
			});
			serverTabs.appendChild(tabButton);

			if (!document.getElementById(`console-${server.id}`)) {
				const consoleDiv = document.createElement('div');
				consoleDiv.classList.add('server-console-output');
				consoleDiv.id = `console-${server.id}`;
				outputArea.appendChild(consoleDiv);
			}
		});

		if (activeConsoleId === null && servers.length > 0) {
		activeConsoleId = servers[0].id;
		updateMainView();
		renderServerTabs(currentServers);
		}
	}
}

function updateMainView() {
	if (activeConsoleId) {
		const activeServer = currentServers.find(s => s.id === activeConsoleId);
		if (activeServer) {
			noServerSelected.style.display = 'none';
			serverDetails.style.display = 'flex';
			serverNameDisplay.textContent = activeServer.name;
			serverPathDisplay.textContent = activeServer.entryFile;
			startButton.disabled = activeServer.status === 'running';
			stopButton.disabled = activeServer.status === 'stopped';

			document.querySelectorAll('.server-console-output').forEach(div => {
				div.classList.remove('active');
			});
			const activeConsoleDiv = document.getElementById(`console-${activeConsoleId}`);
			if (activeConsoleDiv) {
				activeConsoleDiv.classList.add('active');
				outputArea.scrollTop = outputArea.scrollHeight;
			}
		} else {
			noServerSelected.style.display = 'block';
			serverDetails.style.display = 'none';
		}
	} else {
		noServerSelected.style.display = 'block';
		serverDetails.style.display = 'none';
	}
}

addButton.addEventListener('click', async () => {
	const filePath = await window.electronAPI.openFileDialog();
	if (filePath) {
		const updatedServers = await window.electronAPI.addServer(filePath);
		currentServers = updatedServers;
		renderServerTabs(updatedServers);
		updateMainView();
	}
});

startButton.addEventListener('click', async () => {
	if (activeConsoleId) {
		console.log('Start Button Clicked, activeConsoleId:', activeConsoleId);
		await window.electronAPI.startServer(activeConsoleId);
		const updatedServers = await window.electronAPI.getServers();
		currentServers = updatedServers;
		renderServerTabs(updatedServers);
		updateMainView();
	}
});

stopButton.addEventListener('click', async () => {
	if (activeConsoleId) {
		console.log('Stop Button Clicked, activeConsoleId:', activeConsoleId);
		const consoleDiv = document.getElementById(`console-${activeConsoleId}`);
		if (consoleDiv) {
			const stoppingMessage = document.createElement('div');
			stoppingMessage.classList.add('output-header', 'stopping-message');
			stoppingMessage.textContent = `Stopping Server...`;
			consoleDiv.appendChild(stoppingMessage);
		}
		await window.electronAPI.stopServer(activeConsoleId);
		if (consoleDiv) {
			consoleDiv.innerHTML = '';
		}
		const updatedServers = await window.electronAPI.getServers();
		currentServers = updatedServers;
		renderServerTabs(updatedServers);
		updateMainView();
	}
});

removeButton.addEventListener('click', async () => {
	if (activeConsoleId) {
		console.log('Remove Button Clicked, activeConsoleId:', activeConsoleId);
		await window.electronAPI.removeServer(activeConsoleId);
		currentServers = currentServers.filter(s => s.id !== activeConsoleId);
		renderServerTabs(currentServers);
		activeConsoleId = currentServers.length > 0 ? currentServers[0].id : null;
		updateMainView();
	}
});

window.electronAPI.onServerOutput((event, data) => {
	console.log('Server Output Received:', data, 'Active ID:', activeConsoleId);
	const consoleDiv = document.getElementById(`console-${data.id}`);
	if (consoleDiv && data.id === activeConsoleId) {
		const outputLine = document.createElement('div');
		outputLine.classList.add('output-header');
		outputLine.textContent = `> `;
		const outputSpan = document.createElement('span');
		outputSpan.style.color = '#f8f8f2';
		outputSpan.textContent = data.output;
		outputLine.appendChild(outputSpan);
		consoleDiv.appendChild(outputLine);
		outputArea.scrollTop = outputArea.scrollHeight;
	}
});

window.electronAPI.onServerStatusChanged((event, data) => {
	console.log('Server Status Changed:', data, 'Active ID:', activeConsoleId);
	const serverIndex = currentServers.findIndex(s => s.id === data.id);
	if (serverIndex !== -1) {
		currentServers[serverIndex].status = data.status;
		renderServerTabs(currentServers);
		if (data.id === activeConsoleId) {
		updateMainView(); 
		}
	}
});

if (window.electronAPI) {
  	loadSavedAndRenderServers([]);
} else {
 	window.addEventListener('DOMContentLoaded', () => loadSavedAndRenderServers([]));
}

window.electronAPI.onLoadedServers((event, loadedServers) => {
  	loadSavedAndRenderServers(loadedServers);
});