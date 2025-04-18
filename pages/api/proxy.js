export default async function handler(req, res) {
  const url = "https://script.google.com/macros/s/AKfycby0U00VFwJN2VeGQZiP0gLYZi5WNA5R3erjI4Nl4dePQ2RjLgqcDDh2hLZ-0ikteEI/exec";

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Proviamo a forzare la risposta come JSON
    const json = JSON.parse(text);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(json);
  } catch (err) {
    console.error("Errore nella proxy API:", err);
    res.status(500).json({ error: "Errore nella proxy API" });
  }
}
