import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export default function StoricoMemo() {
  const [logMemo, setLogMemo] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "log_memo"), (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordina per data più recente prima
      logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      setLogMemo(logs);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gray-900 text-white flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-center text-green-400">📜 Storico Memo</h1>

      {logMemo.length === 0 ? (
        <div className="text-center text-gray-400">Nessun memo registrato...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {logMemo.map(log => (
            <div
              key={log.id}
              className={`p-3 rounded shadow-md ${log.azione === "creato" ? "bg-green-700" : "bg-red-700"}`}
            >
              <div className="text-sm mb-1">
                {log.azione === "creato" ? "📝 Creato" : "🗑️ Cancellato"} -{" "}
                {new Date(log.timestamp).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}
              </div>
              <div className="text-lg">{log.testo}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
