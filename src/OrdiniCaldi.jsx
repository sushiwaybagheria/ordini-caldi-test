import { useState, useEffect } from "react";

const STAGE_COLORS = {
  "CONFERMATO": "bg-yellow-200",
  "IN PREPARAZIONE": "bg-orange-300",
  "PRONTO": "bg-green-300"
};

const trillo = new Audio("/trillo.mp3");

export default function OrdiniCaldi() {
  const [ordini, setOrdini] = useState([]);

  useEffect(() => {
    fetch("https://script.google.com/macros/s/AKfycby0U00VFwJN2VeGQZiP0gLYZi5WNA5R3erjI4Nl4dePQ2RjLgqcDDh2hLZ-0ikteEI/exec")
      .then(res => res.json())
      .then(data => setOrdini(data))
      .catch(err => console.error("Errore fetch ordini:", err));
  }, []);

  const aggiornaStato = (id, nuovoStato) => {
    setOrdini(prev =>
      prev.map(o =>
        o.id === id ? { ...o, stato: nuovoStato } : o
      )
    );
    if (nuovoStato === "IN PREPARAZIONE") trillo.play();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {ordini.map(ordine => (
        <div
          key={ordine.id}
          className={`p-4 shadow-xl rounded-xl ${STAGE_COLORS[ordine.stato]} transition-all`}
        >
          <div className="space-y-2">
            <div className="font-bold">🧾 {ordine.cliente} ({ordine.tipo})</div>
            <div className="text-sm text-gray-700">🕒 {ordine.orario}</div>
            <ul className="list-disc list-inside text-sm">
              {ordine.piatti.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
            <div className="flex justify-between pt-2 gap-1 flex-wrap">
              <button onClick={() => aggiornaStato(ordine.id, "CONFERMATO")} className="px-2 py-1 bg-white border rounded">Confermato</button>
              <button onClick={() => aggiornaStato(ordine.id, "IN PREPARAZIONE")} className="px-2 py-1 bg-white border rounded">🔔 Preparazione</button>
              <button onClick={() => aggiornaStato(ordine.id, "PRONTO")} className="px-2 py-1 bg-white border rounded">Pronto</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
// forzo build
