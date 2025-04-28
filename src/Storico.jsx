import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default function Storico() {
  const [logMemo, setLogMemo] = useState([]);
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [logTotali, setLogTotali] = useState(0);
  const [caricamentoInCorso, setCaricamentoInCorso] = useState(false);

  useEffect(() => {
    // 🔥 Conta tutti i documenti una sola volta
    const contaTuttiIDocumenti = async () => {
      const snap = await getDocs(collection(db, "log_memo"));
      setLogTotali(snap.size);
    };
    contaTuttiIDocumenti();

    // 🔥 Carica i primi 100
    const primoCaricamento = async () => {
      const q = query(
        collection(db, "log_memo"),
        orderBy("timestamp", "desc"),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const dati = snapshot.docs.map(doc => doc.data());

      setLogMemo(dati);
      setUltimoDoc(snapshot.docs[snapshot.docs.length - 1]); // Memorizza l'ultimo documento
    };

    primoCaricamento();
  }, []);

  const caricaAltriLog = async () => {
    if (!ultimoDoc) return;

    setCaricamentoInCorso(true);

    const q = query(
      collection(db, "log_memo"),
      orderBy("timestamp", "desc"),
      startAfter(ultimoDoc),
      limit(100)
    );

    const snapshot = await getDocs(q);
    const nuoviDati = snapshot.docs.map(doc => doc.data());

    setLogMemo(prev => [...prev, ...nuoviDati]);
    setUltimoDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setCaricamentoInCorso(false);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-6">📜 Storico Memo</h1>

      <p className="text-sm text-gray-400 mb-4">
        {logMemo.length} log caricati su {logTotali} totali
      </p>

      {logMemo.length === 0 ? (
        <p className="text-gray-400">Nessun log disponibile.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {logMemo.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow ${
                log.azione === "creato" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{log.testo}</p>
              <div className="text-xs text-gray-300 mt-2">
                {log.azione === "creato" ? "✏️ Creato" : "🗑️ Cancellato"} il{" "}
                {new Date(log.timestamp).toLocaleString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 Bottone per caricare altri log */}
      {logMemo.length < logTotali && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={caricaAltriLog}
            disabled={caricamentoInCorso}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:opacity-50"
          >
            {caricamentoInCorso ? "Caricamento..." : "+ Carica altri 100"}
          </button>
        </div>
      )}
    </div>
  );
}
