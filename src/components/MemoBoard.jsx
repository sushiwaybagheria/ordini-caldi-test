// components/MemoBoard.jsx
import React from "react";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";

export default function MemoBoard({ memo, setMemo, nuovoMemo, setNuovoMemo, db }) {
  const eliminaMemo = async (id) => {
    const memoDaCancellare = memo.find(m => m.id === id);
    if (memoDaCancellare) {
      const logRef = doc(collection(db, "log_memo"));
      await setDoc(logRef, {
        testo: memoDaCancellare.testo,
        azione: "cancellato",
        timestamp: Date.now(),
        idMemo: id
      });
    }
    await deleteDoc(doc(db, "memo", id));
  };

  const aggiungiMemo = async () => {
    if (!nuovoMemo.trim()) return;

    const ref = doc(collection(db, "memo"));
    await setDoc(ref, {
      testo: nuovoMemo,
      timestamp: Date.now()
    });

    const logRef = doc(collection(db, "log_memo"));
    await setDoc(logRef, {
      testo: nuovoMemo,
      azione: "creato",
      timestamp: Date.now()
    });

    setNuovoMemo("");
  };

  return (
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
        <button onClick={aggiungiMemo} className="px-3 bg-green-500 text-white rounded">
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
  );
}
