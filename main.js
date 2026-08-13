const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require("electron-updater");

const isDev = process.argv.includes('--dev');

// Güncelleme Ayarları
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function checkLicense() {
    const dataPath = path.join(app.getPath('userData'), 'license.json');
    
    if (!fs.existsSync(dataPath)) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 1);
        expiry.setHours(11, 0, 0, 0);
        fs.writeFileSync(dataPath, JSON.stringify({ expiry: expiry.getTime() }));
        return { active: true, expiry: expiry.getTime() };
    }

    const data = JSON.parse(fs.readFileSync(dataPath));
    return { active: true, expiry: data.expiry };
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: { 
            nodeIntegration: false, 
            contextIsolation: true,
            spellcheck: false,
            webSecurity: false
        }
    });

    mainWindow.loadURL('https://www.rgarz.com');

    const license = checkLicense();
    
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS('* { -webkit-user-select: text; }');
        
        const scriptContent = fs.readFileSync(path.join(__dirname, 'src', 'macro.js'), 'utf-8');
        
        mainWindow.webContents.executeJavaScript(`
            try {
                const scriptTag = document.createElement('script');
                scriptTag.textContent = ${JSON.stringify(scriptContent)};
                (document.head || document.documentElement).appendChild(scriptTag);
                
                if (typeof denemeSuresiBildirimiGoster === 'function') {
                    denemeSuresiBildirimiGoster(${license.expiry});
                }

                // Şirin Hoş Geldin Bildirimi
                const toast = document.createElement('div');
                toast.innerHTML = '✨ Dewlemend Makro\\'ya Hoş Geldin! Bol rekora hazır mısın?';
                Object.assign(toast.style, {
                    position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px',
                    background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
                    color: '#fff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    zIndex: '9999999', fontSize: '16px', fontWeight: 'bold', transition: 'opacity 0.5s',
                    fontFamily: 'sans-serif'
                });
                document.body.appendChild(toast);
                setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 5000);

            } catch(e) {
                console.error("Makro enjekte hatası:", e);
            }
        `);
    });
}

app.whenReady().then(() => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => { 
    if (process.platform !== 'darwin') app.quit(); 
});