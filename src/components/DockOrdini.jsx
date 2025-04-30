// components/DockOrdini.jsx
import React from "react";

export default function DockOrdini({ ordini, toggleRidotto, ripristinaOrdine, cancellaCompletati, confermaCancellazione, setConfermaCancellazione, STAGE_COLORS }) {
  return (
    <>
      {/* DOCK RIDOTTI */}
      {ordini.some(o => o.ridotto && !o.completato && !o.archiviato) && (
        <div className="pt-4 border-t border-gray-500">
          <h2 className="text-white text-sm font-semibold mb-2">Dock (ordini minimizzati):</h2>
          <div className="flex flex-wrap gap-2">
            {ordini.filter(o => o.ridotto && !o.completato && !o.archiviato).map(ordine => (
              <div key={ordine.id} className={`shadow-md rounded-lg px-3 py-2 flex items-center justify-between min-w-[200px] ${STAGE_COLORS[ordine.stato] || "bg-white/30"}`}>
                <span className="text-sm font-bold truncate">
                  #{ordine.id} {ordine.tipo === "RITIRO" ? "📦" : "🛵"} {ordine.orario}
                </span>
                <button onClick={() => toggleRidotto(ordine.id)} className="text-lg" title="Espandi">🔼</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCK COMPLETATI */}
      {ordini.some(o => o.completato && !o.archiviato) && (
        <div className="pt-6 border-t border-gray-500">
          <h2 className="text-white text-sm font-semibold mb-2">Ordini completati:</h2>
          <div className="flex flex-wrap gap-2">
            {ordini.filter(o => o.completato && !o.archiviato).map(ordine => (
              <div key={ordine.id} className="shadow-md rounded-lg px-3 py-2 flex items-center justify-between min-w-[200px] bg-green-300">
                <span className="text-sm font-bold truncate">
                  #{ordine.id} {ordine.tipo === "RITIRO" ? "📦" : "🛵"} {ordine.orario}
                </span>
                <button onClick={() => ripristinaOrdine(ordine.id)} className="ml-2 text-xs bg-white px-2 py-1 rounded">↩️</button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            {!confermaCancellazione ? (
              <button onClick={() => setConfermaCancellazione(true)} className="px-4 py-2 bg-red-500 text-white rounded">Cancella tutto</button>
            ) : (
              <div className="space-x-2">
                <span className="text-white">Sei sicuro?</span>
                <button onClick={cancellaCompletati} className="px-3 py-1 bg-red-600 text-white rounded">Cancella</button>
                <button onClick={() => setConfermaCancellazione(false)} className="px-3 py-1 bg-gray-300 rounded">Annulla</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
