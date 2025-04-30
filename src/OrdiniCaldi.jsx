// OrdiniCaldi.jsx
import { useState, useEffect } from "react";
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import OrdineCard from "./components/OrdineCard";
import DockOrdini from "./components/DockOrdini";
import MemoBoard from "./components/MemoBoard";

const STAGE_COLORS = {
  CONFERMATO: "bg-white/30",
  "DA PREPARARE": "bg-yellow-300",
  "IN PREPARAZIONE": "bg-orange-400",
  PRONTO: "bg-green-300"
};

const trillo = new Audio("/trillo.mp3");

export default function OrdiniCaldi() {
  const [ordini, setOrdini] = useState([]);
  const [memo, setMemo] = useState([]);
  const [nuovoMemo, setNuovoMemo] = useState("");
  const [confermaCancellazione, setConfermaCancellazione] = useState(false);

  useEffect(() => {
    const fetchOrdini = async () => {
      try {
        const endpoint = "https://script.google.com/macros/s/.../exec";
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
      unsubTrillo();
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

  const cancellaCompletati = async () => {
    const ordiniDaCancellare = ordini.filter(o => o.completato && !o.archiviato);
    for (const ordine of ordiniDaCancellare) {
      const ref = doc(db, "ordini", ordine.id.toString());
      await setDoc(ref, { ...ordine, archiviato: true });
    }
    setOrdini(prev => prev.map(o => o.completato ? { ...o, archiviato: true } : o));
  };

  return (
    <div className="p-4 min-h-screen bg-gray-800 flex flex-col gap-8 relative">
      <a
        href="/Storico"
        className="text-gray-500 text-[10px] hover:text-white absolute top-2 right-2"
        title="Vai allo storico memo"
      >
        ◼️
      </a>

      <button
        onClick={async () => {
          const ref = doc(db, "trillo", "campanella");
          await setDoc(ref, { timestamp: Date.now() });
        }}
        className="text-2xl font-bold text-center text-red-600"
      >
        🔔 ORDINI CALDI
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {ordini.filter(o => !o.ridotto && !o.completato && !o.archiviato).map(ordine => (
          <OrdineCard
            key={ordine.id}
            ordine={ordine}
            aggiornaStato={aggiornaStato}
            aggiornaNota={aggiornaNota}
            toggleRidotto={toggleRidotto}
            STAGE_COLORS={STAGE_COLORS}
          />
        ))}
      </div>

      <DockOrdini
        ordini={ordini}
        toggleRidotto={toggleRidotto}
        ripristinaOrdine={ripristinaOrdine}
        cancellaCompletati={cancellaCompletati}
        confermaCancellazione={confermaCancellazione}
        setConfermaCancellazione={setConfermaCancellazione}
        STAGE_COLORS={STAGE_COLORS}
      />

      <MemoBoard
        memo={memo}
        setMemo={setMemo}
        nuovoMemo={nuovoMemo}
        setNuovoMemo={setNuovoMemo}
        db={db}
      />
    </div>
  );
}
