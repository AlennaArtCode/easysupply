import React, { useState } from 'react';
import InputField from './components/InputField';
import PredictionResult from './components/PredictionResult';
import { getPrediction } from './services/api';

const AntigravityCore = () => {
  const [inputs, setInputs] = useState({
    family: 12, cluster: 10, promo: 1, oil: 95.5,
    day: 5, payday: 1, holiday: 0, earthquake: 0,
    trans_lag: 3000, sales_lag: 800
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tips = {
    family: "Define el comportamiento de demanda según el tipo de producto (Ej: Alimentos, Aseo).",
    cluster: "Ubicación logística específica para optimizar el tiempo de entrega local.",
    promo: "Ajusta la predicción basándose en el aumento de tráfico esperado por marketing.",
    oil: "Impacto directo en el costo de transporte y flete logístico.",
    day: "Día a proyectar en la cadena de suministro.",
    payday: "Aumento natural de liquidez en el cierre de quincena.",
    holiday: "Influencia de cierres o festividades en el flujo de entrega.",
    earthquake: "Afectación mayor o desastre natural en la cadena de suministro.",
    trans_lag: "Histórico de tráfico (cantidad de tickets) de la semana previa.",
    sales_lag: "Histórico de ventas para establecer tendencias de mercado."
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const ejecutarAnalisis = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // ¡LLAMADA REAL A AWS Sagemaker! No a una simulación de 832.3
      const pred = await getPrediction(inputs);
      setPrediction(pred);
    } catch (err) {
      setError("Fallo en la conexión AWS. Verifica los logs del sistema.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Configuración de los campos avanzados que ya construimos
  const formFields = [
    { name: 'family', label: 'Categoría de Producto', type: 'number' },
    { name: 'oil', label: 'Costo de Combustible (Petróleo)', type: 'number' },
    { name: 'promo', label: 'Estrategia Comercial (Promociones)', type: 'binary' },
    { name: 'holiday', label: '¿Es un Día Festivo?', type: 'binary' },
    { name: 'sales_lag', label: 'Ventas del Mes Anterior', type: 'number' },
    { name: 'cluster', label: 'Punto de Venta (Ubicación)', type: 'number' },
    { name: 'earthquake', label: 'Alerta de Desastre Natural', type: 'binary' },
    { name: 'payday', label: '¿Es Día de Pago (Quincena)?', type: 'binary' },
    { name: 'trans_lag', label: 'Tráfico de Clientes (Semana Pasada)', type: 'number' },
    { 
      name: 'day', 
      label: 'Día de la Semana', 
      type: 'select',
      options: [
        {value: 1, label: 'Lunes'}, {value: 2, label: 'Martes'}, {value: 3, label: 'Miércoles'},
        {value: 4, label: 'Jueves'}, {value: 5, label: 'Viernes'}, {value: 6, label: 'Sábado'}, {value: 7, label: 'Domingo'}
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 text-slate-200 font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Cabecera Profesional (Adaptada al nuevo diseño) */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">EASY SUPPLY</h1>
            <p className="text-orange-500 font-bold tracking-widest text-xs mt-2 italic">CLOUD ARCHITECTURE • INTEGRADOR 2026</p>
          </div>
          <div className="mt-4 md:mt-0 text-right text-[10px] text-slate-500 uppercase flex flex-col gap-1 items-end">
             <div className="flex items-center gap-2">
               Sistema Cognito: <span className="text-green-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> ACTIVO</span>
             </div>
             <div className="flex items-center gap-2">
               IA SageMaker: <span className="text-green-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" style={{animationDelay: '0.3s'}}></span> ONLINE</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Lado A: Configuración de Escenario */}
          <section className="bg-slate-900/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/80 pb-3 mb-5">
              Configuración de Escenario Logístico
            </h3>
            
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.name} className="relative group/field">
                   <div className="flex justify-between items-center mb-1">
                     <label className="text-xs font-bold uppercase text-slate-500">{field.label}</label>
                     <span className="cursor-help text-orange-500/60 hover:text-orange-400 text-xs font-black transition-colors" title={tips[field.name]}>
                       [i]
                     </span>
                   </div>
                   <InputField
                      key={field.name}
                      name={field.name}
                      type={field.type}
                      options={field.options}
                      value={inputs[field.name]}
                      onChange={handleChange}
                    />
                </div>
              ))}
            </div>

            <button 
              onClick={ejecutarAnalisis}
              disabled={loading}
              className={`w-full py-4 mt-6 rounded-2xl font-black text-xs tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(249,115,22,0.5)]'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white/60 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="flex flex-col text-left">
                    <span className="tracking-[0.2em] mb-0.5">GENERANDO PREDICCIÓN...</span>
                    <span className="text-[9px] font-medium tracking-wide text-white/80 normal-case">Procesando variables en AWS Lambda y comparando histórico en DynamoDB</span>
                  </div>
                </div>
              ) : "GENERAR PREDICCIÓN"}
            </button>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-center text-xs font-semibold animate-pulse">
                {error}
              </div>
            )}
          </section>

          {/* Lado B: Resultados e Inteligencia de Negocio */}
          <section className="h-full flex flex-col">
            {prediction !== null ? (
              <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col">
                <PredictionResult prediction={prediction} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/80 bg-slate-900/20 rounded-3xl p-10 mt-6 lg:mt-0">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                   <svg className="w-8 h-8 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <p className="text-slate-500 text-center text-xs uppercase tracking-widest leading-relaxed max-w-xs">
                  Esperando configuración de escenario logístico para procesar en la nube AWS...
                </p>
              </div>
            )}
          </section>

        </div>

        {/* Footer Técnico [cite: 95] */}
        <footer className="text-[10px] text-slate-600 flex flex-col md:flex-row items-center justify-between uppercase tracking-widest pt-10 border-t border-slate-800/50">
          <div className="mb-2 md:mb-0 text-center md:text-left">Arquitectura Integrada: S3 • Lambda • DynamoDB • SageMaker</div>
          <div className="font-bold flex items-center gap-2">
            © 2026 Easy Supply System <span className="px-2 py-1 bg-slate-800 rounded-md text-[8px] text-slate-400 ml-2">ALENNA ART</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AntigravityCore;
