const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Fichier pour stocker les logs
const LOG_FILE = path.join(__dirname, 'received_logs.json');

// Middleware
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json({ limit: '10mb' })); // Parser JSON

// Initialiser le fichier de logs s'il n'existe pas
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2));
}

// Endpoint pour recevoir les logs
app.post('/logs', (req, res) => {
  try {
    const logEntry = req.body;
    
    console.log('📩 Log reçu:', {
      time: logEntry.time,
      method: logEntry.method,
      url: logEntry.url
    });

    // Lire les logs existants
    let logs = [];
    try {
      const data = fs.readFileSync(LOG_FILE, 'utf8');
      logs = JSON.parse(data);
    } catch (err) {
      console.error('Erreur lecture fichier:', err);
    }

    // Ajouter le nouveau log
    logs.push(logEntry);

    // Limiter à 1000 logs max
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    // Sauvegarder
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));

    res.status(200).json({ success: true, message: 'Log enregistré' });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//  Endpoint pour consulter les logs
app.get('/logs', (req, res) => {
  try {
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    const logs = JSON.parse(data);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Endpoint pour vider les logs
app.delete('/logs', (req, res) => {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2));
    res.json({ success: true, message: 'Logs vidés' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Interface web simple pour voir les logs
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Log Viewer</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .log { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .method { font-weight: bold; color: #0066cc; }
        .time { color: #666; font-size: 12px; }
        pre { background: #f9f9f9; padding: 10px; overflow-x: auto; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 Log Viewer</h1>
        <button onclick="refresh()">🔄 Actualiser</button>
        <button onclick="clearLogs()">🗑️ Vider</button>
        <div id="logs"></div>
      </div>
      <script>
        async function refresh() {
          const res = await fetch('/logs');
          const logs = await res.json();
          const div = document.getElementById('logs');
          div.innerHTML = logs.reverse().map(log => \`
            <div class="log">
              <div class="method">\${log.method} \${log.url}</div>
              <div class="time">\${log.time}</div>
              \${log.urlParams ? '<pre>' + JSON.stringify(log.urlParams, null, 2) + '</pre>' : ''}
              \${log.requestBody ? '<pre>' + JSON.stringify(log.requestBody, null, 2) + '</pre>' : ''}
            </div>
          \`).join('');
        }
        async function clearLogs() {
          if (confirm('Vider tous les logs ?')) {
            await fetch('/logs', { method: 'DELETE' });
            refresh();
          }
        }
        refresh();
        setInterval(refresh, 5000); // Auto-refresh toutes les 5s
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur démarré sur http://0.0.0.0:${PORT}`);
  console.log(`📊 Interface web: http://localhost:${PORT}`);
  console.log(`💾 Logs sauvegardés dans: ${LOG_FILE}`);

});
