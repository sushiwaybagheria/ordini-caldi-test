import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

export default function Storico() {
  const [logMemo, setLogMemo] = useState([]);

  useEffect(() => {
  




const q = query(
  collection(db, "log_memo"),
  orderBy("timestamp", "desc"),
  limit(100)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const dati = snapshot.docs.map(doc => doc.data());
  setLogMemo(dati);
});











    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-6">📜 Storico Memo</h1>

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
    </div>
  );
}
