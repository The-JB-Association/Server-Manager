const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs').promises;

const userDataPath = app.getPath('userData');
const serversFilePath = path.join(userDataPath, 'savedServers.json');

let mainWindow;
let servers = [];

async function loadSavedServers() {
	try {
		const data = await fs.readFile(serversFilePath, 'utf-8');
		const savedPaths = JSON.parse(data);
		const loadedServers = [];
		for (const entryFile of savedPaths) {
			const parentDir = path.dirname(entryFile);
			loadedServers.push({
				id: Date.now() + Math.random(),
				name: path.basename(parentDir),
				entryFile: entryFile,
				parentDir: parentDir,
				status: 'stopped'
			});
		}
		return loadedServers;
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.log('Saved servers file not found. Starting with an empty list.');
			return [];
		} else {
			console.error('Error loading saved servers:', error);
		return [];
		}
	}
}

async function saveServers() {
	const pathsToSave = servers.map(server => server.entryFile);
	try {
		await fs.writeFile(serversFilePath, JSON.stringify(pathsToSave), 'utf-8');
		console.log('Servers saved successfully.');
	} catch (error) {
		console.error('Error saving servers:', error);
	}
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		webPreferences: {
		nodeIntegration: false,
		contextIsolation: true,
		preload: path.join(__dirname, 'preload.js')
		},
		autoHideMenuBar: true,
	});

	mainWindow.loadFile('ui/index.html');

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	mainWindow.on('ready-to-show', async () => {
		servers = await loadSavedServers();
		mainWindow.webContents.send('loaded-servers', servers);
	});
}

app.on('ready', createWindow);

app.on('before-quit', saveServers);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.handle('open-file-dialog', async () => {
	const result = await dialog.showOpenDialog(mainWindow, {
		properties: ['openFile'],
		filters: [
		{ name: 'JavaScript Files', extensions: ['js'] }
		]
	});
	return result.filePaths[0];
});

ipcMain.handle('add-server', async (event, entryFile) => {
	const parentDir = path.dirname(entryFile);
	const newServer = {
		id: Date.now() + Math.random(),
		name: path.basename(parentDir),
		entryFile: entryFile,
		parentDir: parentDir,
		status: 'stopped'
	};
	servers.push(newServer);
	await saveServers();
	return servers.map(({ id, name, entryFile, parentDir, status }) => ({ id, name, entryFile, parentDir, status }));
});

ipcMain.handle('get-servers', async () => {
  	return servers.map(({ id, name, entryFile, parentDir, status }) => ({ id, name, entryFile, parentDir, status }));
});

ipcMain.handle('start-server', async (event, id) => {
	const server = servers.find(s => s.id === id);
	if (server && server.status === 'stopped') {
		server.process = spawn('node', [server.entryFile], { cwd: server.parentDir });
		server.status = 'running';

		server.process.stdout.on('data', (data) => {
			console.log(`stdout (${server.name}): ${data}`);
			mainWindow.webContents.send('server-output', { id: server.id, output: data.toString() });
		});

		server.process.stderr.on('data', (data) => {
			console.error(`stderr (${server.name}): ${data}`);
			mainWindow.webContents.send('server-output', { id: server.id, output: data.toString() });
		});

		server.process.on('close', (code) => {
			console.log(`${server.name} process exited with code ${code}`);
			server.status = 'stopped';
			server.process = null;
			mainWindow.webContents.send('server-status-changed', { id: server.id, status: server.status });
		});

		mainWindow.webContents.send('server-status-changed', { id: server.id, status: server.status });
	}
	return servers.map(({ id, name, entryFile, parentDir, status }) => ({ id, name, entryFile, parentDir, status }));
});

ipcMain.handle('stop-server', async (event, id) => {
	const server = servers.find(s => s.id === id);
	if (server && server.status === 'running' && server.process) {
		server.process.kill();
		server.status = 'stopped';
		server.process = null;
		mainWindow.webContents.send('server-status-changed', { id: server.id, status: server.status });
	}
	return servers.map(({ id, name, entryFile, parentDir, status }) => ({ id, name, entryFile, parentDir, status }));
});

ipcMain.handle('remove-server', async (event, id) => {
	servers = servers.filter(s => s.id !== id);
	await saveServers();
	return servers.map(({ id, name, entryFile, parentDir, status }) => ({ id, name, entryFile, parentDir, status }));
});