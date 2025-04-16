import { useState } from "react";

const STAGE_COLORS = {
  "CONFERMATO": "bg-yellow-200",
  "IN PREPARAZIONE": "bg-orange-300",
  "PRONTO": "bg-green-300"
};

const trillo = new Audio("/trillo.mp3");

export default function OrdiniCaldi() {
  console.log("🔥 ORDINI CALDI MOCK ATTIVI");

  const [ordini, setOrdini] = useState([
    {
      cliente: "Mario Rossi",
      tipo: "RITIRO",
      orario: "20:00",
      piatti: ["1 Tempura Gamberi", "2 Gyoza"],
      stato: "CONFERMATO"
    },
    {
      cliente: "Luigi Bianchi",
      tipo: "CONSEGNA",
      orario: "20:30",
      piatti: ["1 Yaki Tori", "1 Zuppa di Miso"],
      stato: "CONFERMATO"
    }
  ]);

  const aggiornaStato = (index, nuovoStato) => {
    setOrdini(prev => {
      const nuovi = [...prev];
      nuovi[index].stato = nuovoStato;
      return nuovi;
    });
    if (nuovoStato === "IN PREPARAZIONE") trillo.play();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
        TEST VERSION - MOCK
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ordini.map((ordine, index) => (
          <div
            key={index}
            className={`p-4 shadow-xl rounded-xl ${STAGE_COLORS[ordine.stato]} transition-all`}
          >
            <div className="space-y-2">
              <div className="font-bold">
                🧾 {ordine.cliente} ({ordine.tipo})
              </div>
              <div className="text-sm text-gray-700">🕒 {ordine.orario}</div>
              <ul className="list-disc list-inside text-sm">
                {ordine.piatti.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <div className="flex justify-between pt-2 gap-1 flex-wrap">
                <button
                  onClick={() => aggiornaStato(index, "CONFERMATO")}
                  className="px-2 py-1 bg-white border rounded"
                >
                  Confermato
                </button>
                <button
                  onClick={() => aggiornaStato(index, "IN PREPARAZIONE")}
                  className="px-2 py-1 bg-white border rounded"
                >
                  🔔 Preparazione
                </button>
                <button
                  onClick={() => aggiornaStato(index, "PRONTO")}
                  className="px-2 py-1 bg-white border rounded"
                >
                  Pronto
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}