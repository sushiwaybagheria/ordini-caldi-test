// components/OrdineCard.jsx
import React from "react";

function calcolaTempoResiduo(dataISO, orarioConsegna) {
  const [hh, mm] = orarioConsegna.split(":" ).map(Number);
  const dataOrdine = new Date(dataISO);
  dataOrdine.setHours(hh, mm, 0, 0);
  const adesso = new Date();
  const diffMin = Math.round((dataOrdine - adesso) / 60000);
  if (diffMin > 0) return `Consegna tra ${diffMin} min`;
  if (diffMin === 0) return "Consegna ora";
  return `In ritardo di ${Math.abs(diffMin)} min`;
}

function staPerScadere(dataISO, orarioConsegna) {
  const [hh, mm] = orarioConsegna.split(":" ).map(Number);
  const dataOrdine = new Date(dataISO);
  dataOrdine.setHours(hh, mm, 0, 0);
  const adesso = new Date();
  const diffMin = Math.round((dataOrdine - adesso) / 60000);
  return diffMin <= 10;
}

export default function OrdineCard({ ordine, aggiornaStato, aggiornaNota, toggleRidotto, STAGE_COLORS }) {
  return (
    <div className={`shadow-xl rounded-xl ${STAGE_COLORS[ordine.stato]} transition-all ${staPerScadere(ordine.data, ordine.orario) ? "border-4 border-yellow-400" : ""}`}>
      <div className="flex justify-between items-start p-2">
        <div className="font-bold text-3xl">
          #{ordine.id} {ordine.tipo === "RITIRO" ? "📦" : "🛵"} {ordine.orario}
          <div className="text-xs text-gray-300 truncate">{ordine.cliente}</div>
        </div>
        <button onClick={() => toggleRidotto(ordine.id)} className="text-lg" title="Riduci">🔽</button>
      </div>
      <div className="p-4 pt-0 space-y-2">
        <ul className="list-disc list-inside text-xl mb-4">
          {ordine.piatti.map((p, i) => (<li key={i}>{p}</li>))}
        </ul>
        <textarea
          className="w-full p-2 text-sm bg-white rounded border mt-8 mb-3"
          rows={2}
          placeholder="Note ordine..."
          value={ordine.note}
          onChange={(e) => aggiornaNota(ordine.id, e.target.value)}
        />
        <div className="flex justify-between pt-2 gap-1 flex-wrap">
          <button onClick={() => aggiornaStato(ordine.id, "CONFERMATO")} className="p-2 bg-white border rounded">🥡</button>
          <button onClick={() => aggiornaStato(ordine.id, "DA PREPARARE")} className="p-2 bg-white border rounded">🔔</button>
          <button onClick={() => aggiornaStato(ordine.id, "IN PREPARAZIONE")} className="p-2 bg-white border rounded">🔥</button>
          <button onClick={() => aggiornaStato(ordine.id, "PRONTO")} className="p-2 bg-white border rounded">✅</button>
        </div>
        <div className="text-[11px] text-right text-gray-400 w-full pr-1">
          {calcolaTempoResiduo(ordine.data, ordine.orario)}
        </div>
      </div>
    </div>
  );
}
