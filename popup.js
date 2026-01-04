const logsDiv = document.getElementById("logs");
const countSpan = document.getElementById("count");

function formatData(data) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  return JSON.stringify(data, null, 2);
}

function render(logs) {
  logsDiv.innerHTML = "";

  if (!logs || logs.length === 0) {
    logsDiv.innerHTML = "<em>Aucun log pour l'instant.</em>";
    countSpan.textContent = "0";
    return;
  }

  countSpan.textContent = logs.length;

  for (const log of logs) {
    const div = document.createElement("div");
    div.className = "log";
    
    let html = `
      <div><strong>${log.method}</strong></div>
      <div class="url">${log.url}</div>
      <div class="meta">${log.time}</div>
    `;

    // Afficher les paramètres URL
    if (log.urlParams && Object.keys(log.urlParams).length > 0) {
      html += `
        <div style="margin-top:8px">
          <strong style="font-size:12px;color:#0066cc">📋 Paramètres URL:</strong>
          <pre style="background:#f5f5f5;padding:6px;border-radius:4px;margin:4px 0;font-size:11px;overflow-x:auto">${formatData(log.urlParams)}</pre>
        </div>
      `;
    }

    // Afficher le body POST
    if (log.requestBody) {
      const typeLabel = {
        'json': 'JSON',
        'formData': 'Form Data',
        'raw': 'Raw'
      }[log.requestBody.type] || 'Data';

      html += `
        <div style="margin-top:8px">
          <strong style="font-size:12px;color:#cc6600">📤 Body (${typeLabel}):</strong>
          <pre style="background:#fff5e6;padding:6px;border-radius:4px;margin:4px 0;font-size:11px;overflow-x:auto">${formatData(log.requestBody.data)}</pre>
        </div>
      `;
    }

    div.innerHTML = html;
    logsDiv.appendChild(div);
  }
}

// Lire le storage à l'ouverture
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("logs", (data) => {
    render(data.logs);
  });
});

// Bouton vider
document.getElementById("clear").addEventListener("click", () => {
  chrome.storage.local.set({ logs: [] }, () => {
    render([]);
  });
});