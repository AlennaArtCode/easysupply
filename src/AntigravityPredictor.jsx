import React, { useState } from 'react';

const AntigravityPredictor = () => {
  // Estado inicial con los parámetros que espera tu modelo en SageMaker
  const [inputs, setInputs] = useState({
    family: 12,
    cluster: 10,
    promo: 1,
    oil: 95.5,
    day: 5,
    payday: 1,
    holiday: 0,
    earthquake: 0,
    trans_lag: 3000,
    sales_lag: 800
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // EL LINK DE ORO ACTUALIZADO
  const API_URL = "https://8byb1f384j.execute-api.us-east-1.amazonaws.com/default/predict";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: parseFloat(value) || 0 });
  };

  const ejecutarPrediccion = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
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
      
      // Manejo de la respuesta (ajusta según si viene directo o en un body string)
      const resultado = typeof data.body === 'string' ? JSON.parse(data.body) : data;
      setPrediction(resultado.prediction);
      
    } catch (err) {
      setError("Fallo en la conexión. Verifica que el CORS en AWS tenga el '*' y hayas dado a Guardar.");
      console.error("Error de conexión:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-200 font-mono flex items-center justify-center relative overflow-hidden">
      {/* Background Glows for Premium Cyberpunk Aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-orange-500/20 p-10 rounded-3xl shadow-[0_20px_50px_rgba(249,115,22,0.1)] relative z-10 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(249,115,22,0.15)]">
        
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent italic tracking-tighter drop-shadow-sm">ANTIGRAVITY CORE</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mt-2 font-semibold flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Intelligence Supply Chain System
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.keys(inputs).map((key) => (
            <div key={key} className="flex flex-col space-y-2 group">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-orange-400 transition-colors">{key.replace('_', ' ')}</label>
              <input
                type="number"
                name={key}
                value={inputs[key]}
                onChange={handleChange}
                className="bg-slate-900/50 border border-slate-700 p-3 rounded-xl text-orange-400 font-bold focus:bg-orange-950/20 focus:border-orange-500 outline-none transition-all focus:shadow-[0_0_15px_rgba(249,115,22,0.15)]"
              />
            </div>
          ))}
        </div>

        <button
          onClick={ejecutarPrediccion}
          disabled={loading}
          className={`w-full mt-10 py-5 rounded-2xl font-black text-sm tracking-widest transition-all duration-300 transform active:scale-[0.98] ${
            loading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:-translate-y-1'
          }`}
        >
          {loading ? 'CALCULANDO EN LA NUBE...' : 'GENERAR PREDICCIÓN'}
        </button>

        {prediction !== null && (
          <div className="mt-8 p-8 bg-gradient-to-br from-green-900/30 to-emerald-900/10 border border-green-500/30 rounded-2xl text-center shadow-[0_0_30px_rgba(34,197,94,0.15)] animate-in fade-in zoom-in duration-500">
            <p className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md">Unidades Estimadas</p>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-green-100 drop-shadow-xl tracking-tighter">{prediction}</div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-center text-xs font-semibold animate-pulse">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AntigravityPredictor;
