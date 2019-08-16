const {app, BrowserWindow} = require('electron'),
			path = require('path'),
			url = require('url');

let win;
const debug = process.argv[2] === 'debug';

function createWindow(){
	win = new BrowserWindow({
							width: 800,
							height:600,
							resizable: false,
							useContentSize:true,
							autoHideMenuBar: true,
							webPreferences: {
								nodeIntegration: true
							}
						});

	win.loadURL(url.format({
		pathname: path.join(__dirname,'index.html'),
		protocol: 'file',
		slashes: true
	}));

	if(debug){
		win.webContents.openDevTools();
	}

	win.on('closed', _ => {
		win = null;
	});
}

app.on('ready',createWindow);

app.on('window-all-closed',_ =>{
	if(process.platform !== 'darwin'){
		app.quit();
	}
});

app.on('activate',_ =>{
	if(!win) {
		createWindow();
	}
});