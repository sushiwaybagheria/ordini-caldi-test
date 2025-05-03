//CalendarioEventi.jsx
import React, { useEffect, useState } from "react";

const API_KEY = "AIzaSyBAZmRNlnTHqRfPvW5SfYEq6ccdcK8AT64";
const CALENDAR_ID = "iuqm2vrl9oi4ccoqps4utmhjoc@group.calendar.google.com";

const CalendarioEventi = () => {
  const [eventi, setEventi] = useState([]);

  useEffect(() => {
    const oggi = new Date();
    const inizio = new Date(oggi.setHours(0, 0, 0)).toISOString();
    const fine = new Date(oggi.setHours(23, 59, 59)).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events?key=${API_KEY}&timeMin=${inizio}&timeMax=${fine}&singleEvents=true&orderBy=startTime`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setEventi(data.items);
        } else {
          console.error("Errore nel fetch:", data);
        }
      });
  }, []);

  return (
    <div className="p-2 text-sm overflow-y-auto h-full">
      <h2 className="font-bold text-center mb-2">📅 Prenotazioni di oggi</h2>
      {eventi.length === 0 && <p className="text-center text-gray-500">Nessun evento</p>}
      <ul className="space-y-2">
        {eventi.map((evento) => {
          const colore = evento.colorId
            ? `bg-google-${evento.colorId}`
            : "bg-blue-200";
          const start = evento.start.dateTime || evento.start.date;
          const orario = new Date(start).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <li
              key={evento.id}
              className="p-2 rounded shadow bg-white border-l-4"
              style={{
                borderColor: `var(--event-color-${evento.colorId || "1"})`,
              }}
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
