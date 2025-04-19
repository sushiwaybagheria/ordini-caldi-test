import { useState, useEffect } from "react";

const STAGE_COLORS = {
  CONFERMATO: "bg-white/30",
  "DA PREPARARE": "bg-yellow-300",
  "IN PREPARAZIONE": "bg-orange-400",
  PRONTO: "bg-green-300"
};

const trillo = new Audio("/trillo.mp3");




function calcolaTempoResiduo(dataISO, orarioConsegna) {
  const [hh, mm] = orarioConsegna.split(":").map(Number);
  const dataOrdine = new Date(dataISO);
  dataOrdine.setHours(hh, mm, 0, 0);

  const adesso = new Date();
  const diffMs = dataOrdine - adesso;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin > 0) return `Consegna tra ${diffMin} min`;
  if (diffMin === 0) return "Consegna ora";
  return `In ritardo di ${Math.abs(diffMin)} min`;
}






export default function OrdiniCaldi() {
  const [ordini, setOrdini] = useState([]);
  const [confermaCancellazione, setConfermaCancellazione] = useState(false);

  useEffect(() => {
    const fetchOrdini = async () => {
      try {
        const endpoint = "https://script.google.com/macros/s/AKfycbyNDg8p5oMOvOH4-v-hesX_AirmxhHH_ow3SXt5Ed3tceIjnox2ABWXo-2rOeUIHTk/exec";
        const res = await fetch(endpoint);
        const data = await res.json();

        const oggi = new Date();
        const ieri = new Date();
        ieri.setDate(oggi.getDate() - 1);

        const format = (d) => d.toISOString().split("T")[0];

        const statiSalvati = JSON.parse(localStorage.getItem("statiOrdini") || "{}");

        const filtrati = data
          .filter(o => {
            const dataOrdine = new Date(o.data);
            const dataStr = format(dataOrdine);
            return dataStr === format(oggi) || dataStr === format(ieri);
          })
          .map(o => ({
            ...o,
            piatti: Array.isArray(o.piatti) ? o.piatti : JSON.parse(o.piatti),
            ridotto: statiSalvati[o.id]?.ridotto || false,
            completato: statiSalvati[o.id]?.completato || false,
            archiviato: statiSalvati[o.id]?.archiviato || false
          }))
          .sort((a, b) => {
            const [ha, ma] = a.orario.split(":").map(Number);
            const [hb, mb] = b.orario.split(":").map(Number);
            return ha * 60 + ma - (hb * 60 + mb);
          });

        setOrdini(filtrati);
      } catch (err) {
        console.error("Errore fetch ordini:", err);
      }
    };

    fetchOrdini();
    const interval = setInterval(fetchOrdini, 30000);
    return () => clearInterval(interval);
  }, []);

  const salvaStatoOrdine = (ordine) => {
    const stati = JSON.parse(localStorage.getItem("statiOrdini") || "{}");
    stati[ordine.id] = {
      ridotto: ordine.ridotto,
      completato: ordine.completato,
      archiviato: ordine.archiviato || false
    };
    localStorage.setItem("statiOrdini", JSON.stringify(stati));
  };

  const aggiornaStato = (id, nuovoStato) => {
    setOrdini(prev =>
      prev.map(o =>
        o.id === id
          ? (salvaStatoOrdine({ ...o, stato: nuovoStato }), { ...o, stato: nuovoStato })
          : o
      )
    );
    if (nuovoStato === "DA PREPARARE") trillo.play();
  };

  const toggleRidotto = (id) => {
    setOrdini(prev =>
      prev.map(o => {
        if (o.id === id) {
          const aggiornato = { ...o, ridotto: !o.ridotto };
          salvaStatoOrdine(aggiornato);
          return aggiornato;
        }
        return o;
      })
    );
  };

  const segnaCompletato = (id) => {
    setOrdini(prev =>
      prev.map(o =>
        o.id === id
          ? (salvaStatoOrdine({ ...o, completato: true, ridotto: true }), { ...o, completato: true, ridotto: true })
          : o
      )
    );
  };

  const cancellaCompletati = () => {
    const nuovi = ordini.map(o =>
      o.completato ? { ...o, archiviato: true } : o
    );
    setOrdini(nuovi);

    const stati = JSON.parse(localStorage.getItem("statiOrdini") || "{}");
    for (let o of nuovi) {
      if (o.archiviato) {
        stati[o.id] = { ...stati[o.id], completato: true, ridotto: true, archiviato: true };
      }
    }
    localStorage.setItem("statiOrdini", JSON.stringify(stati));
    setConfermaCancellazione(false);
  };

  const ripristinaOrdine = (id) => {
    setOrdini(prev =>
      prev.map(o =>
        o.id === id ? { ...o, completato: false, ridotto: false, archiviato: false } : o
      )
    );
    const stati = JSON.parse(localStorage.getItem("statiOrdini") || "{}");
    if (stati[id]) {
      stati[id].completato = false;
      stati[id].ridotto = false;
      stati[id].archiviato = false;
      localStorage.setItem("statiOrdini", JSON.stringify(stati));
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gray-800 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-center text-red-600">ORDINI CALDI</h1>

      {/* POST-IT ATTIVI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {ordini.filter(o => !o.ridotto && !o.completato && !o.archiviato).map(ordine => (
          <div key={ordine.id} className={`shadow-xl rounded-xl ${STAGE_COLORS[ordine.stato] || "bg-white/30"} transition-all`}>
            <div className="flex justify-between items-start p-2">
              <div className="font-bold text-sm">
                #{ordine.id} {ordine.tipo === "RITIRO" ? "📦" : "🛵"} {ordine.orario}
                <div className="text-xs text-gray-700">{calcolaTempoResiduo(ordine.data, ordine.orario)}</div>

              </div>
              <button onClick={() => toggleRidotto(ordine.id)} className="text-lg" title="Riduci">🔽</button>
            </div>
            <div className="p-4 pt-0 space-y-2">
              <ul className="list-disc list-inside text-sm">
                {ordine.piatti.map((p, i) => (<li key={i}>{p}</li>))}
              </ul>
              <div className="flex justify-between pt-2 gap-1 flex-wrap">
                <button onClick={() => aggiornaStato(ordine.id, "CONFERMATO")} className="p-2 bg-white border rounded">🥡</button>
                <button onClick={() => aggiornaStato(ordine.id, "DA PREPARARE")} className="p-2 bg-white border rounded">🔔</button>
                <button onClick={() => aggiornaStato(ordine.id, "IN PREPARAZIONE")} className="p-2 bg-white border rounded">🔥</button>
                <button onClick={() => aggiornaStato(ordine.id, "PRONTO")} className="p-2 bg-white border rounded">✅</button>
                <button onClick={() => segnaCompletato(ordine.id)} className="p-2 bg-white border rounded">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {/* COMPLETATI */}
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
    </div>
  );
}
