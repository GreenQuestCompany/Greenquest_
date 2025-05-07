import express from 'express';
import bodyParser from 'body-parser';
import { registriereNutzer, pruefeLogin } from './datenbank.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './datenbank.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Registrierungs-Route
app.post('/register', (req, res) => {
  const { benutzername, email, passwort } = req.body;

  registriereNutzer(benutzername, email, passwort, (err) => {
    if (err) {
      console.error("Fehler bei der Registrierung:", err);
      return res.status(500).json({ success: false, message: 'Fehler bei der Registrierung.' });
    } else {
      res.json({ success: true, message: 'Benutzer erfolgreich registriert!' });
    }
  });
});

// Login-Route
app.post('/login', (req, res) => {
  const { benutzername, passwort } = req.body;

  if (!benutzername || !passwort) {
    return res.status(400).json({ success: false, message: "Benutzername und Passwort sind erforderlich!" });
  }

  pruefeLogin(benutzername, passwort, (err, user) => {
    if (err) {
      console.error("Fehler bei der Anmeldung:", err);
      return res.status(500).json({ success: false, message: 'Fehler bei der Anmeldung.' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Falsche Zugangsdaten.' });
    }

    res.json({ success: true, message: 'Login erfolgreich', user });
  });
});

// Starte den Server
app.listen(port, () => {
  console.log(`Server läuft unter http://localhost:${port}`);
});

// Temporäre GET-Route zum Löschen aller Daten (nur für Tests)
app.get('/delete-all', (req, res) => {
  const query = 'DELETE FROM nutzer'; // Korrigierter SQL-Befehl

  db.run(query, (err) => {
    if (err) {
      console.error('Fehler beim Löschen der Daten:', err);
      return res.status(500).json({ success: false, message: 'Fehler beim Löschen der Daten.' });
    }

    res.json({ success: true, message: 'Alle Daten wurden erfolgreich gelöscht.' });
  });
});