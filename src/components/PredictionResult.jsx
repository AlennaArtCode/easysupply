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
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-center shadow-lg hover:border-green-500/30 transition-colors group">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 group-hover:text-green-400 transition-colors">Ahorro Logístico</p>
          <p className="text-2xl font-black text-green-500 tracking-tight">{impacto.ahorroLogistico}</p>
          <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-wide">Estimado por optimización</p>
        </div>
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-center shadow-lg hover:border-blue-500/30 transition-colors group">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 group-hover:text-blue-400 transition-colors">Nivel de Servicio</p>
          <p className="text-2xl font-black text-blue-400 tracking-tight">{impacto.nivelServicio}</p>
          <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-wide">Garantía de stock / Satisfacción</p>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center shadow-lg hover:border-cyan-500/30 transition-colors group">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">MÉTRICA ESG: REDUCCIÓN DE HUELLA DE CARBONO</p>
          <p className="text-xl font-black text-cyan-400 tracking-tight">{impacto.reduccionCarbono} kg CO2</p>
        </div>
      </div>

      {/* Mensaje de Valor Final (Conclusión) */}
      <div className="p-5 bg-slate-800/40 backdrop-blur-sm rounded-xl border-l-4 border-orange-500 shadow-inner mt-auto">
        <p className="text-[11px] text-slate-300 italic leading-relaxed">
          "El sistema ha determinado que bajo este contexto operativo operativo y las variables exógenas calculadas matemáticamente por AWS, la prioridad debe ser el <strong className="text-orange-400 font-bold not-italic">reabastecimiento preventivo inmediato</strong> para mitigar riesgos de quiebre."
        </p>
      </div>

    </div>
  );
};

export default PredictionResult;
