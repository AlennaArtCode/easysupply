import React, { useState, useEffect } from 'react';
import InputField from './components/InputField';
import PredictionResult from './components/PredictionResult';
import { getPrediction } from './services/api';
import { PackageSearch, CalendarDays, TrendingUp, AlertTriangle } from 'lucide-react';

const AntigravityCore = () => {
  const [inputs, setInputs] = useState({
    family: 12, cluster: 10, promo: 1, oil: 95.5,
    day: 5, payday: 1, holiday: 0, earthquake: 0,
    trans_lag: 3000, sales_lag: 800
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Firma de Autoría Protegida
  useEffect(() => {
    const authorInfo = {
      Lead_Developer: "Ana Milena Chaves (Alenna Art)",
      System: "Antigravity Core V4.2",
      Certification: "Bootcamp AI Integrator 2026",
      Rights: "Proprietary Logic - Commercial Use Pending"
    };
    console.log("%c⚠️ PROPIEDAD INTELECTUAL DETECTADA", "color: orange; font-weight: bold; font-size: 15px;");
    console.table(authorInfo);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const ejecutarPrediccion = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const pred = await getPrediction(inputs);
      setPrediction(pred);
    } catch (err) {
      setError("Fallo en la conexión. Verifica los registros del servidor o intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Configuración estructurada para agrupar campos logícamente
  const formSections = [
    {
      title: "Contexto del Producto",
      icon: <PackageSearch className="w-4 h-4 text-cyan-400" />,
      fields: [
        { name: 'family', label: 'Código de Familia', type: 'number', helperText: 'ID interno del grupo de productos' },
        { name: 'cluster', label: 'Zona Geográfica (Cluster)', type: 'number', helperText: 'Región de tiendas a predecir' },
        { name: 'promo', label: '¿Está en Promoción?', type: 'binary', helperText: 'Actualmente en descuento o campaña' },
      ]
    },
    {
      title: "Impacto Macroeconómico & Variables Críticas",
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      fields: [
        { name: 'oil', label: 'Precio del Barril (WTI)', type: 'number', helperText: 'Cotización en USD del día' },
        { name: 'earthquake', label: '¿Hubo un Sismo Hoy?', type: 'binary', helperText: 'Afectación mayor en la cadena de suministro' },
      ]
    },
    {
      title: "Calendario y Patrones de Consumo",
      icon: <CalendarDays className="w-4 h-4 text-indigo-400" />,
      fields: [
        { 
          name: 'day', 
          label: 'Día de la Semana', 
          type: 'select', 
          options: [
            {value: 1, label: 'Lunes'}, {value: 2, label: 'Martes'}, {value: 3, label: 'Miércoles'},
            {value: 4, label: 'Jueves'}, {value: 5, label: 'Viernes'}, {value: 6, label: 'Sábado'}, {value: 7, label: 'Domingo'}
          ],
          helperText: 'Día a proyectar'
        },
        { name: 'payday', label: '¿Es Día de Pago (Quincena)?', type: 'binary', helperText: 'Aumento natural de liquidez' },
        { name: 'holiday', label: '¿Es Día Festivo?', type: 'binary', helperText: 'Festividad local o nacional' },
      ]
    },
    {
      title: "Histórico de Tráfico (Hace 1 semana)",
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      fields: [
        { name: 'trans_lag', label: 'Tráfico de Clientes', type: 'number', helperText: 'Cantidad de tickets generados previamente' },
        { name: 'sales_lag', label: 'Ventas Anteriores (UDS)', type: 'number', helperText: 'Volumen líquido vendido la semana anterior' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#060913] p-4 sm:p-8 text-slate-200 font-sans selection:bg-orange-500 selection:text-white flex flex-col items-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 space-y-8 pb-20">
        
        {/* Header Elegante */}
        <header className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 drop-shadow-sm tracking-tight mb-2">
              Antigravity Predictor
            </h1>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
              Sistema Inteligente de Abastecimiento. Configura las variables del entorno logístico para calcular con exactitud la demanda de inventario.
            </p>
          </div>
          <div className="mt-6 md:mt-0 px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-full flex items-center gap-3 shadow-inner">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Enlace AWS Activo</span>
          </div>
        </header>

        {/* Zona de Formularios Organizada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formSections.map((section, idx) => (
            <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/40 rounded-3xl p-6 shadow-xl hover:border-slate-600/60 transition-colors">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/60">
                <div className="p-2 bg-slate-950 rounded-lg shadow-inner">
                  {section.icon}
                </div>
                <h2 className="text-sm font-bold text-slate-200 tracking-wide">{section.title}</h2>
              </div>
              
              <div className="space-y-6">
                {section.fields.map((field) => (
                  <InputField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    options={field.options}
                    helperText={field.helperText}
                    value={inputs[field.name]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Botón Flotante Magnético */}
        <div className="sticky bottom-8 z-50 mt-12 flex justify-center w-full">
          <button
            onClick={ejecutarPrediccion}
            disabled={loading}
            className={`w-full max-w-md py-5 rounded-2xl font-black text-sm tracking-[0.2em] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 shadow-none' 
                : 'bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white shadow-[0_15px_40px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.5)] border border-orange-500/50 hover:-translate-y-2'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                CALCULANDO...
              </>
            ) : (
              'PROYECTAR ESCENARIO AWS'
            )}
          </button>
        </div>

        <PredictionResult prediction={prediction} />

        {error && (
          <div className="mt-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-center text-xs font-semibold animate-pulse max-w-2xl mx-auto">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AntigravityCore;
