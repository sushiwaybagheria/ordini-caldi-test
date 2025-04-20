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

  return diffMin <= 10;
}

export default function OrdiniCaldi() {
  const [ordini, setOrdini] = useState([]);
  const [confermaCancellazione, setConfermaCancellazione] = useState(false);
  const [memo, setMemo] = useState([]);
  const [nuovoMemo, setNuovoMemo] = useState("");

  useEffect(() => {














// START funzione fetchOrdini con debug
const fetchOrdini = async () => {
  try {
    const endpoint = "https://script.google.com/macros/s/AKfycbyNDg8p5oMOvOH4-v-hesX_AirmxhHH_ow3SXt5Ed3tceIjnox2ABWXo-2rOeUIHTk/exec";
    const res = await fetch(endpoint);
    const data = await res.json();

    const oggi = new Date();
    const ieri = new Date();
    ieri.setDate(oggi.getDate() - 1);

    const format = (d) => d.toISOString().split("T")[0];

    const tuttiGliId = data.map(o => o.id);

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

    const filtratiId = filtrati.map(o => o.id);
    const esclusi = tuttiGliId.filter(id => !filtratiId.includes(id));
    console.warn("Ordini esclusi (non passano il filtro data):", esclusi);

    console.log("Ordini filtrati finali:", filtrati.map(o => ({
      id: o.id,
      archiviato: o.archiviato,
      stato: o.stato,
      cliente: o.cliente
    })));

    setOrdini(filtrati);
  } catch (err) {
    console.error("Errore fetch ordini:", err);
  }
};
// END funzione fetchOrdini con debug























    fetchOrdini();

    const unsubscribeMemo = onSnapshot(collection(db, "memo"), (snapshot) => {
      const dati = snapshot.docs.map(doc => ({
        id: doc.id,
        testo: doc.data().testo
      }));
      setMemo(dati);
    });

    const interval = setInterval(fetchOrdini, 30000);

    const unsubscribe = onSnapshot(collection(db, "ordini"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const ordineAggiornato = change.doc.data();
          setOrdini(prevOrdini => {
            return prevOrdini.map(o => {
              if (o.id.toString() === change.doc.id) {
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
      unsubscribeMemo();
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
    setOrdini(prev =>
      prev.map(o =>
        o.id === id
          ? (salvaStatoOrdine({ ...o, stato: nuovoStato }), { ...o, stato: nuovoStato })
          : o
      )
    );
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

  const aggiornaNota = (id, nuovaNota) => {
    setOrdini(prev =>
      prev.map(o =>
        o.id === id
          ? (salvaStatoOrdine({ ...o, note: nuovaNota }), { ...o, note: nuovaNota })
          : o
      )
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

  const eliminaMemo = async (id) => {
    await deleteDoc(doc(db, "memo", id));
  };

  return (
    <div className="p-4 min-h-screen bg-gray-800 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-center text-red-600">ORDINI CALDI</h1>

      {/* ... ordini attivi, dock e completati ... */}

      {/* START blocco Memo */}
      <div className="pt-8 border-t border-gray-500 mt-4">
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
              const ref = doc(collection(db, "memo"));
              await setDoc(ref, { testo: nuovoMemo });
              setNuovoMemo("");
            }}
            className="px-3 bg-green-500 text-white rounded"
          >
            Aggiungi
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {memo.map(m => (
            <div
              key={m.id}
              className="bg-yellow-200 text-black px-3 py-2 rounded-xl shadow min-w-[200px] relative"
            >
              <button
                onClick={() => eliminaMemo(m.id)}
                className="absolute top-0 right-1 text-red-500"
                title="Elimina"
              >
                ✖
              </button>
              <p className="text-sm whitespace-pre-wrap">{m.testo}</p>
            </div>
          ))}
        </div>
      </div>
      {/* END blocco Memo */}
    </div>
  );
}
