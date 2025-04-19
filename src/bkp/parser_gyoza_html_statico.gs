
function doGet() {
  const body = HtmlService.createHtmlOutputFromFile("mock_email_gyoza").getContent();
  let piatti = [];

  const articoliCaldi = [
    "tempura gamberi", "gamberone kataifi", "tempure salmone", "tempura mix", "sfoglie di gambero", "tempura di tonno", "tempure verdure",
    "cottobox", "starterbox", "hosomaki salmone in tempura", "hosomaki tonno in tempura", "futomaki ebitempura in tempura",
    "futomaki brazil in tempura", "futomaki granchio in tempura", "futomaki philadelfia in tempura",
    "gyoza", "kushi sake", "yaki tori", "zuppa di miso", "zuppa di pollo", "shoyu ramen",
    "hotphila almond", "hotphila pistacchio", "hotmaki guacamole", "hotmaki katsuobushi",
    "hotphila shiitake", "hotphila tropea", "hotphila fragole", "hot spicy", "new hotphila almond"
  ];

  function normalizza(testo) {
    return testo.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchCaldo(nome) {
    const normalizzato = normalizza(nome);
    return articoliCaldi.some(caldo => normalizzato === normalizza(caldo));
  }

  const righe = body.split(/<tr[^>]*>/gi);
  let gyozaDetected = false;
  let gyozaLine = "";
  let gyozaOpts = [];

  for (let riga of righe) {
    const firstDivMatch = riga.match(/<div>(.*?)<\/div>/i);
    const qtyMatch = riga.match(/<td[^>]*>(\d+)<\/td>/i);
    if (firstDivMatch && qtyMatch) {
      let nome = firstDivMatch[1].replace(/-\s*ravioli giapponesi/i, "").trim();
      const quantita = parseInt(qtyMatch[1]);

      if (matchCaldo(nome)) {
        const normalizzato = normalizza(nome);
        if (normalizzato.includes("gyoza")) {
          gyozaDetected = true;
          gyozaLine = quantita + "x Gyoza";
          gyozaOpts = [];
          continue;
        } else {
          piatti.push(quantita + "x " + nome);
        }
      }
    }

    const opzioni = [...riga.matchAll(/<i>\+([^<€]*)/gi)];
    for (let op of opzioni) {
      const testo = op[1].replace(/\s*&euro;.*$/, "").trim();
      if (gyozaDetected && /(verdure|gambero|pollo)/i.test(testo)) {
        gyozaOpts.push(testo);
      } else if (!gyozaDetected && matchCaldo(testo)) {
        piatti.push("+" + testo);
      }
    }

    if (gyozaDetected && gyozaOpts.length >= 3) {
      piatti.push(gyozaLine + " | " + gyozaOpts.join(" | "));
      gyozaDetected = false;
      gyozaLine = "";
      gyozaOpts = [];
    }
  }

  Logger.log(JSON.stringify(piatti, null, 2));
  return ContentService.createTextOutput("Parsing completato. Vedi log.");
}
