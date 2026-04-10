import React, { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { PackageSearch, ArrowRight, AlertCircle, CheckCircle2, Factory, Calendar, DollarSign, Tag, TrendingUp, CalendarDays, Activity, Info, Database } from 'lucide-react';

const LabelWithTooltip = ({ icon: Icon, title, tooltipText }) => (
  <div className="flex items-center gap-2 mb-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
      {Icon && <Icon className="w-4 h-4 text-cyan-500" />} {title}
    </label>
    <div className="relative group flex items-center justify-center">
      <Info className="w-4 h-4 text-slate-500 hover:text-fuchsia-400 cursor-help transition-colors drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]" />
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 opacity-0 transition-opacity group-hover:opacity-100 z-50 bg-slate-900 border border-slate-700/50 text-slate-100 font-medium text-xs leading-relaxed rounded-xl py-2.5 px-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-center">
        {tooltipText}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900"></div>
      </div>
    </div>
  </div>
);

// === RUTA DE AWS ESTATICA ===
const API_URL = 'https://8byb1f384j.execute-api.us-east-1.amazonaws.com/default/easy-supply-api';

export default function Dashboard({ signOut, user }) {
  const [formData, setFormData] = useState({
    categoria: '1',
    petroleo: '85.56',
    diaSemana: '3',
    festivo: '0',
    quincena: '0',
    ventasHistoricas: '8100',
    promocion: '0',
    estacional1: '0.15',
    estacional2: '0.18'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Estado para el historial
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Función asíncrona para obtener el historial
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const { tokens } = await fetchAuthSession();
      const jwtToken = tokens?.idToken?.toString() || tokens?.accessToken?.toString();
      
      if (!jwtToken) return;

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Authorization': jwtToken }
      });

      const data = await response.json();
      
      // Decodificación universal adaptada al nuevo Master Prompt (data.historial)
      let rawRecords = data.historial || data.Items || data.items || data;
      
      if (rawRecords.body) {
         try {
            let parsedBody = typeof rawRecords.body === 'string' ? JSON.parse(rawRecords.body) : rawRecords.body;
            rawRecords = parsedBody.historial || parsedBody.Items || parsedBody.items || parsedBody;
         } catch(e) {}
      }

      if (Array.isArray(rawRecords)) {
        const sorted = rawRecords.sort((a, b) => {
           const dateA = a.Fecha || a.fecha;
           const dateB = b.Fecha || b.fecha;
           return new Date(dateB) - new Date(dateA);
        });
        setHistory(sorted); // Actualiza el estado de la tabla
      }
    } catch (err) {
      console.error("Error cargando el historial de DynamoDB", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Traer historial cuando se monta el componente y calcular variables temporales
  useEffect(() => {
    fetchHistory();

    // Automatización de Tiempo
    const today = new Date();
    
    // JS getDay(): 0 (Domingo) - 6 (Sábado) -> Mapeamos a 1 (Lunes) - 7 (Domingo)
    let dayIdx = today.getDay();
    dayIdx = dayIdx === 0 ? 7 : dayIdx;

    // Calcular Quincena
    const dayOfMonth = today.getDate();
    const isQuincena = [14, 15, 16, 29, 30, 31].includes(dayOfMonth) ? '1' : '0';

    setFormData(prev => ({
      ...prev,
      diaSemana: dayIdx.toString(),
      quincena: isQuincena
    }));

  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const hasEmptyFields = Object.values(formData).some(val => val === '');
    if (hasEmptyFields) {
       setError('SISTEMA INCOMPLETO: Faltan variables en los vectores de análisis.');
       setLoading(false);
       return;
    }

    try {
      const { tokens } = await fetchAuthSession();
      const jwtToken = tokens?.idToken?.toString() || tokens?.accessToken?.toString();

      if (!jwtToken) throw new Error('AUTH-ERROR: Handshake de token fallido.');

      // 1. Empaquetar datos de los sliders en un tensor continuo 
      const tensorArray = [
        Number(formData.categoria),
        Number(formData.petroleo),
        Number(formData.diaSemana),
        Number(formData.festivo),
        Number(formData.quincena),
        Number(formData.ventasHistoricas),
        Number(formData.promocion),
        Number(formData.estacional1),
        Number(formData.estacional2)
      ];

      // 2. Dispara la petición
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': jwtToken, 
        },
        body: JSON.stringify({ tensor: tensorArray })
      });

      if (!response.ok) {
        let detalleError = 'Error interno en la ejecución de Lambda.';
        try {
          const textRes = await response.text();
          try {
            const jsonRes = JSON.parse(textRes);
            detalleError = jsonRes.detalle || jsonRes.error || jsonRes.message || textRes;
          } catch(e) {
            detalleError = textRes;
          }
        } catch(e) {}

        if (response.status === 401 || response.status === 403) {
           throw new Error('ACCESS DENIED: Código 401. Renovar sesión.');
        }
        throw new Error(`AWS REJECT [${response.status}]: ${detalleError.substring(0, 150)}`);
      }

      const rawData = await response.json();
      console.log("📦 CONTENIDO REAL DE AWS:", rawData);

      // 1. Intentamos extraer el cuerpo si viene envuelto por API Gateway
      let procesado = rawData.body 
        ? (typeof rawData.body === 'string' ? JSON.parse(rawData.body) : rawData.body) 
        : rawData;

      console.log("🔍 Depurando respuesta:", procesado);

      // 2. Buscamos el valor en TODAS las variantes posibles
      const volumenFinal = procesado.volumen ?? procesado.volumen_proyectado ?? procesado.proyeccion ?? procesado.prediction ?? procesado.ventas_estimadas;

      if (volumenFinal !== undefined) {
         console.log("✅ ¡Volumen encontrado!:", volumenFinal);
         setResult(volumenFinal);
         fetchHistory();
      } else {
         console.error("❌ Estructura fallida. Recibimos esto:", procesado);
         throw new Error('DATA FORMAT EXCEPTION: El servidor no envió el volumen proyectado.');
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'NET_ERR: Conexión al servidor neural interceptada.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full rounded-xl border border-slate-700/50 bg-slate-900/50 py-2.5 px-4 text-slate-100 focus:bg-slate-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all outline-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] placeholder:text-slate-600";
  const selectStyles = inputStyles + " appearance-none";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      
      {/* GLOWING AMBIENT BACKGROUND FX */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* HEADER */}
      <header className="border-b border-white/5 sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-cyan-400 border border-slate-800 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <PackageSearch className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                 EASY SUPPLY
               </h1>
               <div className="text-[10px] tracking-[0.2em] font-medium text-fuchsia-400 uppercase">
                  Central Logistics Panel
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
             <div className="hidden sm:flex flex-col items-end">
               <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Active Link</span>
               <span className="text-sm font-medium text-cyan-300 drop-shadow-[0_0_5px_rgba(103,232,249,0.5)]">
                 {user?.username || 'GUEST_OVERRIDE'}
               </span>
             </div>
             <div className="w-px h-8 bg-slate-800 hidden sm:block mx-1"></div>
             <button
              onClick={signOut}
              className="text-sm font-semibold tracking-wide text-slate-400 hover:text-slate-100 transition-colors py-2 px-4 rounded-lg border border-transparent hover:border-slate-800 hover:bg-slate-900 hover:shadow-lg"
            >
              DISCONNECT
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight drop-shadow-sm">
            Forecast Terminal
          </h2>
          <p className="mt-2 text-slate-400 font-light tracking-wide">
            Calibre los tensores de predicción para proyectar el volumen logístico futuro.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 xl:gap-8 relative">
          
          {/* FORM AREA */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-visible">
              
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

              <div className="border-b border-slate-800/60 px-6 py-5 flex items-center gap-3 rounded-t-2xl bg-slate-900/30">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                <h3 className="font-semibold text-slate-200 tracking-wide uppercase text-sm">Input de Variables de Entorno</h3>
              </div>
              
              <form onSubmit={handlePredict} className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-7">
                  
                  {/* Categoría */}
                  <div>
                    <LabelWithTooltip 
                      icon={Factory} 
                      title="Familia del Producto" 
                      tooltipText="Categoría del artículo. Ayuda a la IA a identificar patrones de compra específicos de este sector." 
                    />
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                      className={selectStyles}
                    >
                      <option value="" className="bg-slate-900 text-slate-400">Seleccionar...</option>
                      <option value="0" className="bg-slate-900">Abarrotes (0)</option>
                      <option value="1" className="bg-slate-900">Lácteos (1)</option>
                      <option value="2" className="bg-slate-900">Cuidado Personal (2)</option>
                      <option value="3" className="bg-slate-900">Bebidas (3)</option>
                    </select>
                  </div>

                  {/* Precio Petróleo */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <LabelWithTooltip 
                        icon={DollarSign} 
                        title="Precio WTI" 
                        tooltipText="Precio internacional del petróleo. Impacta directamente en los costos logísticos." 
                      />
                      <span className="text-cyan-400 font-mono text-sm font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                        ${formData.petroleo} USD
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="0.1"
                      name="petroleo"
                      value={formData.petroleo}
                      onChange={handleInputChange}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:accent-cyan-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-widest">
                      <span>$0</span>
                      <span>$200</span>
                    </div>
                  </div>

                  {/* Día de la semana */}
                  <div>
                    <LabelWithTooltip 
                      icon={CalendarDays} 
                      title="Día Semana" 
                      tooltipText="El tráfico de clientes y el volumen de compra varían drásticamente según el día." 
                    />
                    <select
                      name="diaSemana"
                      value={formData.diaSemana}
                      onChange={handleInputChange}
                      className={selectStyles}
                    >
                      <option value="" className="bg-slate-900">Seleccionar...</option>
                      <option value="1" className="bg-slate-900">Lunes</option>
                      <option value="2" className="bg-slate-900">Martes</option>
                      <option value="3" className="bg-slate-900">Miércoles</option>
                      <option value="4" className="bg-slate-900">Jueves</option>
                      <option value="5" className="bg-slate-900">Viernes</option>
                      <option value="6" className="bg-slate-900">Sábado</option>
                      <option value="7" className="bg-slate-900">Domingo</option>
                    </select>
                  </div>

                  {/* Festivo */}
                  <div>
                     <LabelWithTooltip 
                      icon={Calendar} 
                      title="¿Festivo?" 
                      tooltipText="Los días festivos suelen alterar el comportamiento normal de la demanda en tienda." 
                    />
                    <select
                      name="festivo"
                      value={formData.festivo}
                      onChange={handleInputChange}
                      className={selectStyles}
                    >
                      <option value="0" className="bg-slate-900">No (0)</option>
                      <option value="1" className="bg-slate-900">Sí (1)</option>
                    </select>
                  </div>

                  {/* Quincena */}
                  <div>
                     <LabelWithTooltip 
                      icon={DollarSign} 
                      title="¿Quincena?" 
                      tooltipText="Los días cercanos al pago de nómina (15 y 30) incrementan el poder adquisitivo del cliente." 
                    />
                    <select
                      name="quincena"
                      value={formData.quincena}
                      onChange={handleInputChange}
                      className={selectStyles}
                    >
                      <option value="0" className="bg-slate-900">No (0)</option>
                      <option value="1" className="bg-slate-900">Sí (1)</option>
                    </select>
                  </div>

                  {/* Ventas Históricas */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <LabelWithTooltip 
                        icon={TrendingUp} 
                        title="Ventas Pasadas" 
                        tooltipText="Volumen de unidades vendidas en el ciclo anterior para establecer un punto de partida." 
                      />
                      <span className="text-cyan-400 font-mono text-sm font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                        {formData.ventasHistoricas} UDS
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="100"
                      name="ventasHistoricas"
                      value={formData.ventasHistoricas}
                      onChange={handleInputChange}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:accent-cyan-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-widest">
                      <span>0</span>
                      <span>20k</span>
                    </div>
                  </div>

                  {/* Promoción */}
                  <div>
                     <LabelWithTooltip 
                      icon={Tag} 
                      title="¿Promoción?" 
                      tooltipText="Indica si el producto tendrá algún descuento activo que pueda disparar las ventas." 
                    />
                    <select
                      name="promocion"
                      value={formData.promocion}
                      onChange={handleInputChange}
                      className={selectStyles}
                    >
                      <option value="0" className="bg-slate-900">No (0)</option>
                      <option value="1" className="bg-slate-900">Sí (1)</option>
                    </select>
                  </div>

                  {/* Estacional 1 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <LabelWithTooltip 
                        title="Índice de Temporada" 
                        tooltipText="Factor de estacionalidad (ej. temporada escolar, navidad). Usa 0 para baja y 1 para alta." 
                      />
                      <span className="text-cyan-400 font-mono text-sm font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                        {formData.estacional1}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.01"
                      name="estacional1"
                      value={formData.estacional1}
                      onChange={handleInputChange}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:accent-cyan-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-widest">
                      <span>0.0</span>
                      <span>1.0</span>
                    </div>
                  </div>

                  {/* Estacional 2 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <LabelWithTooltip 
                        title="Tendencia Mensual" 
                        tooltipText="Crecimiento o decrecimiento general del mercado esperado para este mes. (Ej: 0.15)." 
                      />
                      <span className="text-cyan-400 font-mono text-sm font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                        {formData.estacional2}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.01"
                      name="estacional2"
                      value={formData.estacional2}
                      onChange={handleInputChange}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:accent-cyan-300 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-widest">
                      <span>0.0</span>
                      <span>1.0</span>
                    </div>
                  </div>

                </div>

                <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <p className="text-xs text-slate-500 hidden sm:block tracking-wide font-mono w-1/2">
                    <span className="text-cyan-600 font-bold">INFO:</span> Modelo XGBoost Ensamble calibrado para procesar tensor numérico matricial.
                  </p>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 py-3.5 px-10 rounded-xl text-slate-950 bg-cyan-400 hover:bg-cyan-300 focus:ring-4 focus:ring-cyan-500/40 font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.7)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden"
                  >
                    {/* Botón Neon Glow internamente */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                    {loading ? (
                      <span className="flex items-center gap-3 relative z-10">
                        <svg className="animate-spin -ml-1 mr-1 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ejecutando Modelo...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 relative z-10">
                        Iniciar Predicción
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RESULT AREA */}
          <div className="lg:col-span-1 flex flex-col h-full">
            {/* ESTADO VACIO */}
            {!result && !error && !loading && (
               <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 bg-slate-900/30 backdrop-blur-sm">
                  <div className="w-20 h-20 text-slate-700 flex items-center justify-center mb-6">
                    <Activity className="w-16 h-16 opacity-30" />
                  </div>
                  <h4 className="text-slate-400 font-medium tracking-widest text-sm uppercase mb-3">En espera</h4>
                  <p className="text-slate-600 text-xs text-center font-mono max-w-[200px]">
                    SISTEMA LISTO. Ingrese parámetros para generar inferencia neuronal.
                  </p>
               </div>
            )}

            {/* LOADER PLACEHOLDER */}
            {loading && (
              <div className="flex-1 min-h-[300px] flex items-center justify-center rounded-2xl p-8 bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                  <div className="space-y-6 w-full flex flex-col items-center relative z-10">
                     <div className="h-16 w-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                     <div className="h-2 bg-slate-800 rounded w-1/3 animate-pulse"></div>
                     <div className="h-6 bg-slate-800 rounded w-2/3 animate-pulse"></div>
                  </div>
              </div>
            )}

            {/* RESULTADO (EXITO) */}
            {result !== null && !loading && (
              <div className="flex-1 min-h-[300px] bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] border border-cyan-500/50 p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group">
                
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                
                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="mx-auto w-16 h-16 bg-cyan-950/80 border border-cyan-400 text-cyan-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-cyan-400 font-semibold tracking-[0.2em] uppercase text-xs mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,1)]"></span>
                    Volumen Proyectado
                  </h3>
                  <div className="text-5xl lg:text-7xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-6 font-mono">
                    {typeof result === 'number' ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(result) : result}
                  </div>
                  <div className="w-full bg-slate-950/80 backdrop-blur-sm border border-slate-800 py-4 px-5 rounded-xl text-left">
                     <p className="text-[10px] text-fuchsia-400 font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                       <TrendingUp className="w-3 h-3" />
                       Data Source Tensor
                     </p>
                     <p className="text-xs text-slate-300 font-mono break-all line-clamp-2">
                       [{Object.values(formData).join(',')}]
                     </p>
                  </div>
                </div>
              </div>
            )}

            {/* RESULTADO (ERROR) */}
            {error && !loading && (
              <div className="flex-1 min-h-[300px] bg-red-950/30 backdrop-blur-xl rounded-2xl border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] p-6 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 bg-red-900/50 border border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-full flex items-center justify-center">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-red-400 font-black tracking-widest mb-2 uppercase text-sm">System Fracture</h3>
                      <p className="text-slate-300 text-sm font-mono leading-relaxed">{error}</p>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* NEW SECTION: HISTORIAL DE TENSIONES LOGÍSTICAS       */}
        {/* ==================================================== */}
        <div className="mt-12 bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden relative">
           
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

           <div className="border-b border-slate-800/60 px-6 py-5 flex items-center gap-3 bg-slate-900/30">
              <Database className="w-5 h-5 text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              <h3 className="font-bold text-slate-200 tracking-widest uppercase text-sm">Historial de Tensiones Logísticas</h3>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-950/60 border-b border-cyan-900/40 text-xs text-cyan-500 uppercase tracking-widest font-mono shadow-sm shadow-black/50">
                   <th className="px-6 py-4 font-bold">Fecha</th>
                   <th className="px-6 py-4 font-bold">Tensores de Entrada</th>
                   <th className="px-6 py-4 font-bold">Modelo</th>
                   <th className="px-6 py-4 font-bold text-right">Volumen Proyectado</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                 {history.map((row, idx) => {
                   // Compatibilidad: soportar nombres viejos y nuevos de DynamoDB
                   const rawEntrada = row.datos_entrada || row.Datos_Entrada || '';
                   const rawModelo = row.modelo_usado || row.Modelo || 'XGBoost_v1';
                   const rawVolumen = row.prediccion_ventas ?? row.Volumen_Proyectado ?? row.volumen ?? 'N/A';
                   const rawFecha = row.fecha || row.Fecha || 'N/A';

                   // Lógica de decodificación de negocio para aportar valor al usuario final
                   let arr = [];
                   if (typeof rawEntrada === 'string') {
                      try {
                        const parsed = JSON.parse(rawEntrada);
                        arr = parsed.tensor || Object.values(parsed);
                      } catch(e) {
                        arr = rawEntrada.split(',');
                      }
                   } else if (Array.isArray(rawEntrada)) {
                      arr = rawEntrada;
                   } else if (typeof rawEntrada === 'object') {
                      arr = rawEntrada.tensor || Object.values(rawEntrada);
                   }
                   
                   const categoryMap = ['Abarrotes', 'Lácteos', 'Cuidado', 'Bebidas'];
                   const daysMap = ['?', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

                   return (
                     <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                       <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap group-hover:text-cyan-200 transition-colors">
                          {rawFecha}
                       </td>
                       <td className="px-6 py-4 text-xs">
                          {arr.length >= 7 ? (
                            <div className="flex flex-wrap gap-2">
                               <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded shadow-inner border border-slate-700">📦 {categoryMap[parseInt(arr[0])] || 'Cat'}</span>
                               <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded shadow-inner border border-slate-700">🛢️ ${arr[1]} WTI</span>
                               <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded shadow-inner border border-slate-700">📅 {daysMap[parseInt(arr[2])] || 'Día'}</span>
                               {arr[6] === '1' && <span className="bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-500/30 px-2 py-1 rounded">🏷️ Promo</span>}
                               {arr[5] && <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">Ventas: {arr[5]}</span>}
                            </div>
                          ) : (
                            <span className="font-mono text-slate-500 opacity-70">[{typeof rawEntrada === 'string' ? rawEntrada : JSON.stringify(rawEntrada)}]</span>
                          )}
                       </td>
                       <td className="px-6 py-4">
                         <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                           {rawModelo}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <span className="text-sm font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] font-mono">
                           {typeof rawVolumen === 'number' || !isNaN(rawVolumen)
                              ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(rawVolumen)) 
                              : rawVolumen}
                         </span>
                       </td>
                     </tr>
                   );
                 })}
                 
                 {/* EMPTY STATE */}
                 {history.length === 0 && !loadingHistory && (
                   <tr>
                     <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-sm font-mono uppercase tracking-widest bg-slate-900/20">
                       <Database className="w-8 h-8 opacity-20 mx-auto mb-3" />
                       Banco neural vacío. Ejecute predicciones.
                     </td>
                   </tr>
                 )}

                 {/* LOADING STATE */}
                 {loadingHistory && (
                   <tr>
                     <td colSpan="4" className="px-6 py-12 text-center text-cyan-500/60 text-sm font-mono uppercase tracking-widest animate-pulse bg-slate-900/20">
                       Sincronizando registros con pasarela AWS...
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </main>
    </div>
  );
}
