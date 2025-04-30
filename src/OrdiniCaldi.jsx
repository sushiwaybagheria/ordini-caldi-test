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

  const forzaControlloOrdini = async () => {
    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbyNDg8p5oMOvOH4-v-hesX_AirmxhHH_ow3SXt5Ed3tceIjnox2ABWXo-2rOeUIHTk/exec?action=controlloIncrementale", {
        method: "POST",
      });
      const text = await res.text();
      alert("✅ " + text);
    } catch (err) {
      alert("❌ Errore durante il controllo: " + err.message);
    }
  };

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

  // ... resto del componente (omesso per brevità)

  return (
    <div className="p-4">
      <button onClick={forzaControlloOrdini} className="px-4 py-2 bg-blue-600 text-white rounded shadow">
        🔁 Controlla nuovi ordini ora
      </button>
      {/* ...resto del layout */}
    </div>
  );
}
