const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// URL Web Hosting Utama (Ganti dengan alamat domain hosting Anda sendiri jika ada)
const ONLINE_URL = 'https://template-soal-bimasoft.vercel.app';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    title: "Generator Template Soal Bimasoft v.1.3.0",
    // Standard application icon can be set if needed
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools();
  } else {
    // Mode Produksi: Coba muat halaman online terlebih dahulu (untuk update 0 MB).
    // Jika offline atau gagal memuat, secara otomatis alihkan ke berkas lokal statis.
    win.loadURL(ONLINE_URL).catch(() => {
      console.log('Koneksi offline. Memuat berkas lokal statis...');
      win.loadFile(path.join(__dirname, 'dist/index.html'));
    });

    // Pasang pendengar kegagalan jika koneksi terputus saat memuat halaman online
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      if (validatedURL && validatedURL.startsWith(ONLINE_URL)) {
        console.log('Gagal memuat URL online. Mengalihkan ke cadangan lokal statis...');
        win.loadFile(path.join(__dirname, 'dist/index.html'));
      }
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  // Check for updates and notify user (only in production)
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
