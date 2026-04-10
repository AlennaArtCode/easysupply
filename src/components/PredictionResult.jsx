import React from 'react';

const PredictionResult = ({ prediction }) => {
  if (prediction === null) return null;

  return (
    <div className="mt-8 p-8 bg-gradient-to-br from-green-900/30 to-emerald-900/10 border border-green-500/30 rounded-2xl text-center shadow-[0_0_30px_rgba(34,197,94,0.15)] animate-in fade-in zoom-in duration-500">
      <p className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md">
        Unidades Estimadas
      </p>
      <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-green-100 drop-shadow-xl tracking-tighter">
        {prediction}
      </div>
    </div>
  );
};

export default PredictionResult;
