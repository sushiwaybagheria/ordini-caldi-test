import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, collection, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";







const STAGE_COLORS = {
  CONFERMATO: "bg-white/30",
  "DA PREPARARE": "bg-yellow-300",
  "IN PREPARAZIONE": "bg-orange-400",
  PRONTO: "bg-green-300"
};

const trillo = new Audio("/trillo.mp3");

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

export default function OrdiniCaldi() {
  const [ordini, setOrdini] = useState([]);
  const [confermaCancellazione, setConfermaCancellazione] = useState(false);
  const [memo, setMemo] = useState([]);
  const [nuovoMemo, setNuovoMemo] = useState("");

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
          const [ha, ma] = a.orario.split(":" ).map(Number);
          const [hb, mb] = b.orario.split(":" ).map(Number);
          return ha * 60 + ma - (hb * 60 + mb);
        });

        setOrdini(filtrati);
      } catch (err) {
        console.error("Errore fetch ordini:", err);
      }
    };

    fetchOrdini();

    const unsubscribeMemo = onSnapshot(collection(db, "memo"), (snapshot) => {






const dati = snapshot.docs.map(doc => ({
  id: doc.id,
  testo: doc.data().testo,
  timestamp: doc.data().timestamp
}));

// Riordina dal più recente al più vecchio
dati.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

setMemo(dati);
}); 






    const interval = setInterval(fetchOrdini, 30000);

    const unsubscribe = onSnapshot(collection(db, "ordini"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const ordineAggiornato = change.doc.data();
          setOrdini(prev => prev.map(o =>
            o.id.toString() === change.doc.id
              ? (o.stato !== "DA PREPARARE" && ordineAggiornato.stato === "DA PREPARARE" ? trillo.play() : null,
                { ...o, ...ordineAggiornato })
              : o
          ));
        }
      });
    });


const unsubTrillo = onSnapshot(doc(db, "trillo", "campanella"), (snap) => {
  if (snap.exists()) {
    trillo.play();
  }
});



    return () => {
      clearInterval(interval);
      unsubscribe();
      unsubscribeMemo();
 unsubTrillo();  // 👈 aggiunto questo
    };
  }, []);

  const salvaStatoOrdine = async (ordine) => {
    const ref = doc(db, "ordini", ordine.id.toString());
    await setDoc(ref, {
      stato: ordine.stato,
      ridotto: ordine.ridotto,
      completato: ordine.completato,
      archiviato: ordine.archiviato || false,
      note: ordine.note || ""
    });
  };

  const aggiornaStato = (id, nuovoStato) => {
    setOrdini(prev => prev.map(o =>
      o.id === id ? (salvaStatoOrdine({ ...o, stato: nuovoStato, completato: nuovoStato === "PRONTO" }), { ...o, stato: nuovoStato, completato: nuovoStato === "PRONTO" }) : o
    ));
    if (nuovoStato === "DA PREPARARE") trillo.play();
  };

  const aggiornaNota = (id, nuovaNota) => {
    setOrdini(prev => prev.map(o =>
      o.id === id ? (salvaStatoOrdine({ ...o, note: nuovaNota }), { ...o, note: nuovaNota }) : o
    ));
  };

  const toggleRidotto = (id) => {
    setOrdini(prev => prev.map(o => {
      if (o.id === id) {
        const aggiornato = { ...o, ridotto: !o.ridotto };
        salvaStatoOrdine(aggiornato);
        return aggiornato;
      }
      return o;
    }));
  };



const ripristinaOrdine = (id) => {
  setOrdini(prev =>
    prev.map(o =>
      o.id === id
        ? (salvaStatoOrdine({ ...o, completato: false, ridotto: false, archiviato: false }), { ...o, completato: false, ridotto: false, archiviato: false })
        : o
    )
  );
};









  const eliminaMemo = async (id) => {
  // 🔥 1. Prima recupera il memo da cancellare
  const memoDaCancellare = memo.find(m => m.id === id);

  if (memoDaCancellare) {
    // 🔥 2. Scrivi nel log prima di cancellarlo
    const logRef = doc(collection(db, "log_memo"));
    await setDoc(logRef, {
      testo: memoDaCancellare.testo,
      azione: "cancellato",
      timestamp: Date.now(),
      idMemo: id
    });
  }

  // 🔥 3. Ora cancella il memo
  await deleteDoc(doc(db, "memo", id));
};







  return (
<>
  <style>
    {`
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .fade-in {
        animation: fadeIn 0.4s ease-out;
      }
    `}
  </style>









<div className="p-4 min-h-screen bg-gray-800 flex flex-col gap-8 relative">
  
  {/* 🔥 Pulsante Log */}
  <a
    href="/Storico"
    className="text-gray-500 text-xs hover:text-white absolute top-2 right-2"
    title="Vai allo storico memo"
  >
    📜 Log
  </a>










  {/* 🔔 Campanella per Trillo */}
      

<button
  onClick={async () => {
    const ref = doc(db, "trillo", "campanella");
    await setDoc(ref, { timestamp: Date.now() });
  }}
 className="text-2xl font-bold text-center text-red-600"

  >
    🔔 ORDINI CALDI
  </button>


  {/* Fine Campanella */}














      {/* ORDINI ATTIVI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {ordini.filter(o => !o.ridotto && !o.completato && !o.archiviato).map(ordine => (
          <div key={ordine.id} className={`shadow-xl rounded-xl ${STAGE_COLORS[ordine.stato]} transition-all ${staPerScadere(ordine.data, ordine.orario) ? "border-4 border-yellow-400" : ""}`}>
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




{/* MEMO */}
<div className="pt-8 border-t border-gray-500">
  <h2 className="text-white text-sm font-semibold mb-2">📌 Memo</h2>







  <div className="flex gap-2 mb-4">
    <input
      type="text"
      className="flex-1 p-2 rounded border"
      placeholder="Scrivi un nuovo memo..."
      value={nuovoMemo}
      onChange={(e) => setNuovoMemo(e.target.value)}
    />
    <button







    onClick={async () => {
  if (!nuovoMemo.trim()) return;

  // 🔥 1. Salva il memo normale
  const ref = doc(collection(db, "memo"));
  await setDoc(ref, { 
    testo: nuovoMemo, 
    timestamp: Date.now()
  });

  // 🔥 2. Scrivi anche nel log
  const logRef = doc(collection(db, "log_memo"));
  await setDoc(logRef, {
    testo: nuovoMemo,
    azione: "creato",
    timestamp: Date.now()
  });

  setNuovoMemo("");
}}








      className="px-3 bg-green-500 text-white rounded"
    >
      Aggiungi
    </button>
  </div>
  <div className="flex flex-wrap gap-2">
    {memo.map(m => (
      <div key={m.id} className="bg-yellow-200 text-black px-3 py-2 rounded-xl shadow min-w-[200px] relative">
        <button onClick={() => eliminaMemo(m.id)} className="absolute top-0 right-1 text-red-500" title="Elimina">✖</button>





<p className="text-sm whitespace-pre-wrap">{m.testo}</p>




{m.timestamp && (
  <div className="text-[10px] text-gray-600 mt-1">
    {(() => {
      const dataMemo = new Date(m.timestamp);
      const oggi = new Date();
      const ieri = new Date();
      ieri.setDate(oggi.getDate() - 1);

      const format = (d) => d.toISOString().split("T")[0];

      if (format(dataMemo) === format(oggi)) {
        return `Oggi alle ${dataMemo.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })}`;
      } else if (format(dataMemo) === format(ieri)) {
        return `Ieri alle ${dataMemo.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })}`;
      } else {
         return `${dataMemo.toLocaleDateString("it-IT")} alle ${dataMemo.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })}`;
                }
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>

</div> {/* 👈 QUI chiude il div p-4 min-h-screen */}

</>
);
}

