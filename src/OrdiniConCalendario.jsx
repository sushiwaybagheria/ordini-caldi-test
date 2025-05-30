// OrdiniConCalendario.jsx
import React from "react";
import OrdiniCaldi from "./OrdiniCaldi"; // componente esistente
import CalendarioEventi from "./CalendarioEventi";

const GoogleCalendarEmbed = () => {
  return (
    <iframe










    src="https://calendar.google.com/calendar/embed?src=iuqm2vrl9oi4ccoqps4utmhjoc@group.calendar.google.com&mode=AGENDA&ctz=Europe%2FRome"
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
        🔧 VERSIONE CON CALENDARIO 
      </div>




      <div className="flex flex-1 overflow-auto">
  <div className="w-[90%] overflow-y-auto bg-gray-800">
    <OrdiniCaldi />
  </div>
  <div className="w-[10%] border-l border-gray-400 bg-white">
    <div className="h-full">
      <CalendarioEventi />
    </div>
  </div>
</div>



    </div>
  );
};

export default OrdiniConCalendario;
