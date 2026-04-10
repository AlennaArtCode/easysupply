export const API_URL = "https://8byb1f384j.execute-api.us-east-1.amazonaws.com/default/predict";

export const getPrediction = async (inputs) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputs),
  });

  if (!response.ok) {
    throw new Error(`Error en AWS: ${response.statusText}`);
  }

  const data = await response.json();
  const resultado = typeof data.body === 'string' ? JSON.parse(data.body) : data;
  return resultado.prediction;
};

export const getPredictionHistory = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) return [];
  
  const data = await response.json();
  let rawRecords = data.historial || data.Items || data.items || data;
  
  if (rawRecords && rawRecords.body) {
    try {
      let parsedBody = typeof rawRecords.body === 'string' ? JSON.parse(rawRecords.body) : rawRecords.body;
      rawRecords = parsedBody.historial || parsedBody.Items || parsedBody.items || parsedBody;
    } catch(e) {}
  }

  if (Array.isArray(rawRecords)) {
    return rawRecords.sort((a, b) => {
      const dateA = a.Fecha || a.fecha || a.timestamp || 0;
      const dateB = b.Fecha || b.fecha || b.timestamp || 0;
      return new Date(dateB) - new Date(dateA);
    });
  }
  return [];
};

