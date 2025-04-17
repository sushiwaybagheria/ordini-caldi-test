// File: /api/proxy.js

export default async function handler(req, res) {
  const url = "https://script.google.com/macros/s/AKfycby0U00VFwJN2VeGQZiP0gLYZi5WNA5R3erjI4Nl4dePQ2RjLgqcDDh2hLZ-0ikteEI/exec";

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate");
    res.status(200).json(data);
  } catch (err) {
    console.error("Errore nella proxy API:", err);
    res.status(500).json({ error: "Errore nella proxy API" });
  }
}
