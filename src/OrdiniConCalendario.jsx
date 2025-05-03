// OrdiniConCalendario.jsx
import React from "react";
import OrdiniCaldi from "./OrdiniCaldi"; // importa il tuo componente attuale

const GoogleCalendarEmbed = () => {
  return (
    <iframe
      src="https://calendar.google.com/calendar/embed?src=iuqm2vrl9oi4ccoqps4utmhjoc@group.calendar.google.com
&mode=AGENDA&ctz=Europe%2FRome"
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
    <div className="flex h-screen">
      <div className="w-3/4 bg-gray-800 overflow-y-auto">
        <OrdiniCaldi />
      </div>
      <div className="w-1/4 border-l border-gray-400 bg-white">
        <GoogleCalendarEmbed />
      </div>
    </div>
  );
};

export default OrdiniConCalendario;
