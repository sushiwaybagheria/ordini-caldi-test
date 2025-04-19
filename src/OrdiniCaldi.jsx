import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";







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


function staPerScadere(dataISO, orarioConsegna) {
  const [hh, mm] = orarioConsegna.split(":").map(Number);
  const dataOrdine = new Date(dataISO);
  dataOrdine.setHours(hh, mm, 0, 0);

  const adesso = new Date();
  const diffMin = Math.round((dataOrdine - adesso) / 60000);

  // Bordi gialli se mancano meno di 10 minuti oppure se è già passato
  return diffMin <= 10;
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

      const filtrati = await Promise.all(
        data
          .filter(o => {
            const dataOrdine = new Date(o.data);
            const dataStr = format(dataOrdine);
            return dataStr === format(oggi) || dataStr === format(ieri);
          })
          .map(async o => {
            const docRef = doc(db, "ordini", o.id.toString());
            const snap = await getDoc(docRef);
            const stato = snap.exists() ? snap.data() : {};
            return {
              ...o,
              piatti: Array.isArray(o.piatti) ? o.piatti : JSON.parse(o.piatti),
              stato: stato.stato || o.stato || "CONFERMATO",
              ridotto: stato.ridotto || false,
              completato: stato.completato || false,
              archiviato: stato.archiviato || false,
note: stato.note || ""

            };
          })
      );

      filtrati.sort((a, b) => {
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

  // Listener Firebase per aggiornamenti in tempo reale
  const unsubscribe = onSnapshot(collection(db, "ordini"), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "modified") {
        const ordineAggiornato = change.doc.data();
        setOrdini(prevOrdini => {
          return prevOrdini.map(o => {
            if (o.id.toString() === change.doc.id) {
              // Attiva il trillo quando passa a "DA PREPARARE"
              if (o.stato !== "DA PREPARARE" && ordineAggiornato.stato === "DA PREPARARE") {
                trillo.play();
              }
              return { ...o, ...ordineAggiornato };
            }
            return o;
          });
        });
      }
    });
  });

  return () => {
    clearInterval(interval);
    unsubscribe();
  };
}, []);










  const salvaStatoOrdine = async (ordine) => {
    const ref = doc(db, "ordini", ordine.id.toString());




   // START salvataggio stato ordine con campo note
await setDoc(ref, {
  stato: ordine.stato,
  ridotto: ordine.ridotto,
  completato: ordine.completato,
  archiviato: ordine.archiviato || false,
  note: ordine.note || ""
});
// END salvataggio stato ordine con campo note
};





const aggiornaStato = (id, nuovoStato) => {
  setOrdini(prev =>
    prev.map(o =>
      o.id === id
        ? (salvaStatoOrdine({ ...o, stato: nuovoStato }), { ...o, stato: nuovoStato })
        : o
    )
  );
  
  // Riproduci sempre il trillo localmente quando passa a "DA PREPARARE"
  if (nuovoStato === "DA PREPARARE") {
    trillo.play();
  }
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



// START funzione aggiornaNota
const aggiornaNota = (id, nuovaNota) => {
  setOrdini(prev =>
    prev.map(o =>
      o.id === id
        ? (salvaStatoOrdine({ ...o, note: nuovaNota }), { ...o, note: nuovaNota })
        : o
    )
  );
};
// END funzione aggiornaNota










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
    nuovi.forEach(o => {
      if (o.archiviato) salvaStatoOrdine(o);
    });
    setConfermaCancellazione(false);
  };

  




const ripristinaOrdine = (id) => {
    setOrdini(prev =>
      prev.map(o =>
        o.id === id ? (salvaStatoOrdine({ ...o, completato: false, ridotto: false, archiviato: false }), { ...o, completato: false, ridotto: false, archiviato: false }) : o
      )
    );
  };

  return (
    <div className="p-4 min-h-screen bg-gray-800 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-center text-red-600">ORDINI CALDI</h1>

      {/* POST-IT ATTIVI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {ordini.filter(o => !o.ridotto && !o.completato && !o.archiviato).map(ordine => (
          


<div 
  key={ordine.id} 
  className={`shadow-xl rounded-xl ${STAGE_COLORS[ordine.stato] || "bg-white/30"} transition-all
    ${staPerScadere(ordine.data, ordine.orario) ? "border-4 border-yellow-400" : ""}`}>







            <div className="flex justify-between items-start p-2">
            <div className="font-bold text-3xl">


                #{ordine.id} {ordine.tipo === "RITIRO" ? "📦" : "🛵"} {ordine.orario}
                <div className="text-xs text-gray-700">{calcolaTempoResiduo(ordine.data, ordine.orario)}</div>
              </div>
              <button onClick={() => toggleRidotto(ordine.id)} className="text-lg" title="Riduci">🔽</button>
            </div>
            <div className="p-4 pt-0 space-y-2">
              <ul className="list-disc list-inside text-xl">

                {ordine.piatti.map((p, i) => (<li key={i}>{p}</li>))}
              </ul>


// START campo note ordine
<textarea
  className="w-full p-2 text-sm bg-white rounded border mt-2"
  rows={2}
  placeholder="Note ordine..."
  value={ordine.note}
  onChange={(e) => aggiornaNota(ordine.id, e.target.value)}
></textarea>
// END campo note ordine



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
