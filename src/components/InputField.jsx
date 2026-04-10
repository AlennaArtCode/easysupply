import React from 'react';
import { AlertCircle } from 'lucide-react';

const InputField = ({ label, name, value, onChange, type = 'number', options = [], helperText }) => {
  const isBinary = type === 'binary';
  const isSelect = type === 'select';

  const handleBinaryChange = (val) => {
    onChange({ target: { name, value: val } });
  };

  return (
    <div className="flex flex-col space-y-2 group">
      <label className="text-xs font-bold text-slate-400 group-focus-within:text-orange-400 transition-colors uppercase tracking-wider">
        {label}
      </label>
      
      {isBinary ? (
        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleBinaryChange(1)}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              value === 1 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            SÍ
          </button>
          <button
            type="button"
            onClick={() => handleBinaryChange(0)}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              value === 0 
                ? 'bg-slate-700 text-slate-200 border border-slate-500/50' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            NO
          </button>
        </div>
      ) : isSelect ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="bg-slate-900/50 border border-slate-700/50 p-3 rounded-xl text-orange-400 font-bold focus:bg-orange-950/20 focus:border-orange-500 outline-none transition-all focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] appearance-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          step={name === 'oil' ? '0.01' : '1'}
          className="bg-slate-900/50 border border-slate-700/50 p-3 rounded-xl text-orange-400 font-bold focus:bg-orange-950/20 focus:border-orange-500 outline-none transition-all focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] w-full"
        />
      )}

      {helperText && (
        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1">
          <AlertCircle className="w-3 h-3 text-slate-600" />
          {helperText}
        </p>
      )}
    </div>
  );
};

export default InputField;
