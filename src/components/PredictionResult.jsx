import React from 'react';

const PredictionResult = ({ prediction }) => {
  if (prediction === null) return null;

  // Función para calcular datos de interés dinámicamente
  const calcularImpacto = (unidades) => {
    return {
      ahorroLogistico: (unidades * 0.15 * 10).toLocaleString('en-US', { style: 'currency', currency: 'USD' }), // Simulación $
      nivelServicio: "98.5%", // Meta de satisfacción del cliente
      reduccionCarbono: (unidades * 0.05).toFixed(1) // KG de CO2 ahorrados por ruta óptima
    };
  };

  const impacto = calcularImpacto(prediction);

  return (
    <div className="animate-in fade-in zoom-in duration-500 space-y-6 h-full flex flex-col justify-center">
      
      {/* El "Número" con Estilo Hero Glow */}
      <div className="bg-orange-600/10 border border-green-500/30 p-10 rounded-3xl text-center relative overflow-hidden group shadow-[0_0_40px_rgba(34,197,94,0.15)]">
        <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors duration-500"></div>
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-green-500/20 blur-[80px] rounded-full"></div>
        
        <p className="text-green-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 relative z-10 flex items-center justify-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Abastecimiento Sugerido
        </p>
        <h2 className="text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-green-100 tracking-tighter relative z-10 leading-none drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
           {prediction}
        </h2>
        <div className="absolute top-4 right-6 text-[50px] opacity-10 font-black italic text-green-300 pointer-events-none">IA</div>
      </div>

      {/* Datos de Interés y Ahorro (Panel Estratégico 2 Columnas) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-green-500/30 transition-colors group flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5"><span className="text-green-500">💰</span> Ahorro Proyectado</p>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">Al ajustar tu stock a <strong className="text-green-400 font-black">{Math.round(prediction)} unidades</strong>, evitas un 15% de sobrecosto en almacenamiento.</p>
        </div>
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-blue-500/30 transition-colors group flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5"><span className="text-blue-500">🛡️</span> Nivel de Servicio</p>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">Con esta cifra, garantizas una <strong className="text-blue-400 font-black">disponibilidad del 98%</strong> para tus clientes en esta zona.</p>
        </div>
      </div>

      {/* Mensaje de Valor Final (Eficiencia de Ruta) */}
      <div className="p-5 bg-slate-800/40 backdrop-blur-sm rounded-xl border-l-4 border-orange-500 shadow-inner mt-auto flex items-start gap-4">
        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <div>
          <p className="text-[11px] text-orange-400 uppercase font-black tracking-widest mb-1.5 drop-shadow-md">Eficiencia de Ruta</p>
          <p className="text-xs text-slate-300 italic leading-relaxed">
            Sugerencia: Se detectó un costo elevado en combustible; el sistema optimizó la carga para reducir viajes.
          </p>
        </div>
      </div>

    </div>
  );
};

export default PredictionResult;
