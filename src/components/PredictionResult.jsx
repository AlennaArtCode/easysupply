import React from 'react';

const PredictionResult = ({ prediction }) => {
  if (prediction === null) return null;

  return (
    <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* THE HERO SECTION: Neon Glow Container */}
      <div className="relative p-10 bg-slate-900/80 border border-green-500/50 rounded-3xl text-center shadow-[0_0_50px_rgba(34,197,94,0.3)] overflow-hidden group">
        <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors duration-500"></div>
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-green-500/20 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          <p className="text-green-400 text-sm font-black uppercase tracking-[0.3em] mb-4 drop-shadow-md flex items-center justify-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Luz Verde para Abastecer
          </p>
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-green-200 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] tracking-tighter">
            {prediction}
          </div>
          <p className="text-slate-400 text-xs mt-3 uppercase tracking-widest font-semibold">Unidades Optimizadas</p>
        </div>
      </div>

      {/* CONCLUSIONES ESTRATÉGICAS */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl">
        <h3 className="text-orange-400 font-black text-lg mb-4 flex items-center gap-2">
          <span>🎯</span> Impacto Estratégico Detectado
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="mt-1 p-1 bg-green-500/20 rounded-md">
              <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">Ahorro en Almacén</p>
              <p className="text-xs text-slate-400 mt-1">Al predecir con exactitud, reduces el exceso de stock logístico en un 15%.</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="mt-1 p-1 bg-cyan-500/20 rounded-md">
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">Eficiencia Logística</p>
              <p className="text-xs text-slate-400 mt-1">El sistema sugiere calibrar rutas de despacho basándose en el costo actual del petróleo y transporte.</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="mt-1 p-1 bg-orange-500/20 rounded-md">
              <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">Garantía de Servicio</p>
              <p className="text-xs text-slate-400 mt-1">Estás asegurando que la demanda del producto llegará al cliente final sin quiebres de stock ni retrasos.</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default PredictionResult;
