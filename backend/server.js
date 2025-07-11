const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Percorso assoluto verso presenze.json (dentro la cartella backend)
const FILE = path.join(__dirname, 'presenze.json');

app.use(cors());
app.use(express.json());

// GET: restituisce il contenuto di presenze.json
app.get('/presenze', (req, res) => {
  if (fs.existsSync(FILE)) {
    const data = fs.readFileSync(FILE, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json({});
  }
});

// POST: salva il contenuto ricevuto in presenze.json
app.post('/presenze', (req, res) => {
  console.log('Ricevuto dal frontend:', req.body); // DEBUG
  fs.writeFileSync(FILE, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
