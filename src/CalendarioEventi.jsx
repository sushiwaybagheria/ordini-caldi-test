//CalendarioEventi.jsx
import React, { useEffect, useState } from "react";

const API_KEY = "AIzaSyBAZmRNlnTHqRfPvW5SfYEq6ccdcK8AT64";
const CALENDAR_ID = "iuqm2vrl9oi4ccoqps4utmhjoc@group.calendar.google.com";



const CalendarioEventi = () => {
  const [eventi, setEventi] = useState([]);
  const [colori, setColori] = useState({});

  useEffect(() => {
    // 1. Carica mappa colori da Google Calendar
    fetch(`https://www.googleapis.com/calendar/v3/colors?key=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
console.log("Eventi ricevuti:", data.items);
        if (data.event) {
          setColori(data.event);
        }
      });

    // 2. Carica eventi del giorno
    const oggi = new Date();
    const inizio = new Date(oggi.setHours(0, 0, 0)).toISOString();
    const fine = new Date(new Date().setHours(23, 59, 59)).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events?key=${API_KEY}&timeMin=${inizio}&timeMax=${fine}&singleEvents=true&orderBy=startTime`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
console.log("Eventi ricevuti:", data.items);
        if (data.items) {
          setEventi(data.items);
        } else {
          console.error("Errore nel fetch eventi:", data);
        }
      });
  }, []);

  return (
    <div className="p-2 text-sm overflow-y-auto h-full">
      <h2 className="font-bold text-center mb-2">📅 Prenotazioni di oggi</h2>
      {eventi.length === 0 && <p className="text-center text-gray-500">Nessun evento</p>}
      <ul className="space-y-2">
        {eventi.map((evento) => {
          const start = evento.start.dateTime || evento.start.date;
          const orario = new Date(start).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const colorId = evento.colorId || "1";
          const colore = colori[colorId]?.background || "#a4bdfc";

          return (
            <li
              key={evento.id}
              className="p-2 rounded shadow bg-white border-l-4"
              style={{ borderColor: colore }}
            >
              <div className="font-semibold">{orario}</div>
              <div className="text-gray-800">{evento.summary}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CalendarioEventi;
