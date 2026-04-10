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
