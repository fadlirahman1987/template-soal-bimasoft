const { spawn } = require('child_process');
const http = require('http');

const port = 5173;
const url = `http://localhost:${port}`;
let viteProcess = null;

function checkViteReady(attempts = 0) {
  const req = http.get(url, (res) => {
    console.log('Vite server is ready! Launching Electron...');
    launchElectron();
  });

  req.on('error', () => {
    if (attempts === 0) {
      console.log('Vite server is not running. Starting Vite dev server...');
      startVite();
    } else {
      console.log('Waiting for Vite server to be ready...');
    }
    setTimeout(() => checkViteReady(attempts + 1), 1000);
  });
}

function startVite() {
  viteProcess = spawn('npx', ['vite'], {
    shell: true,
    stdio: 'inherit'
  });

  viteProcess.on('error', (err) => {
    console.error('Failed to start Vite dev server:', err);
  });
}

function launchElectron() {
  const electronProcess = spawn('npx', ['electron', '.'], {
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: 'inherit'
  });

  electronProcess.on('close', () => {
    if (viteProcess) {
      console.log('Closing Vite dev server...');
      viteProcess.kill();
    }
    process.exit(0);
  });
}

// Start checking
checkViteReady();
