// OrdiniConCalendario.jsx
import React from "react";
import OrdiniCaldi from "./OrdiniCaldi"; // componente esistente

const GoogleCalendarEmbed = () => {
  return (
    <iframe





      src="https://calendar.google.com/calendar/u/0?cid=aW5mb0BzdXNoaXdheS5pdA"
      style={{ border: 0 }}
      width="100%"
      height="100%"
      frameBorder="0"
      scrolling="no"
      title="Calendario prenotazioni"
    ></iframe>
  );
};

const OrdiniConCalendario = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* 🔧 Banner di test */}
      <div className="bg-yellow-500 text-black text-sm font-bold text-center py-1 shadow z-10">
        🔧 VERSIONE DI TEST – Non usare per la produzione
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-3/4 overflow-y-auto bg-gray-800">
          <OrdiniCaldi />
        </div>
        <div className="w-1/4 border-l border-gray-400 bg-white">
          <GoogleCalendarEmbed />
        </div>
      </div>
    </div>
  );
};

export default OrdiniConCalendario;
