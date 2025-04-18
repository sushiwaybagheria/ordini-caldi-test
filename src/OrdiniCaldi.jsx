import { useEffect, useState } from "react";

export default function OrdiniCaldi() {
  const [ordini, setOrdini] = useState([]);

  useEffect(() => {
    const fetchOrdini = async () => {
      try {
        const endpoint = "https://script.google.com/macros/s/AKfycby0U00VFwJN2VeGQZiP0gLYZi5WNA5R3erjI4Nl4dePQ2RjLgqcDDh2hLZ-0ikteEI/exec";
        const proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(endpoint);
        const res = await fetch(proxy);
        const data = await res.json();
        const oggi = new Date().toISOString().split("T")[0];
        const filtrati = data.filter(o => o.data === oggi);
        setOrdini(filtrati);
      } catch (err) {
        console.error("Errore fetch ordini (AllOrigins):", err);
      }
    };

    fetchOrdini();
    const interval = setInterval(fetchOrdini, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gray-800 text-white">
      <h1 className="text-2xl font-bold text-center text-red-600">ORDINI CALDI (AllOrigins)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-6">
        {ordini.map((ordine) => (
          <div key={ordine.id} className="bg-white/30 p-4 rounded-xl shadow-xl">
            <div className="font-bold text-sm mb-1">
              #{ordine.id} {ordine.tipo === "RITIRO" ? "📦" : "🛵"} {ordine.orario}
            </div>
            <ul className="list-disc list-inside text-sm">
              {ordine.piatti.map((p, i) => (<li key={i}>{p}</li>))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
