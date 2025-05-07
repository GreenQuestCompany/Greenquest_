import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
export { db };
const db = new sqlite3.Database('./antworten.db');

// Tabellen erstellen (nur einmal beim Start des Programms)
db.serialize(() => {
  db.all('SELECT id, passwort FROM nutzer', (err, rows) => {
    if (err) {
      console.error('Fehler beim Abrufen der Nutzer:', err);
      return;
    }

    rows.forEach((row) => {
      const hashedPassword = bcrypt.hashSync(row.passwort, 10);
      db.run('UPDATE nutzer SET passwort = ? WHERE id = ?', [hashedPassword, row.id], (updateErr) => {
        if (updateErr) {
          console.error(`Fehler beim Aktualisieren des Passworts für Nutzer mit ID ${row.id}:`, updateErr);
        } else {
          console.log(`Passwort für Nutzer mit ID ${row.id} erfolgreich aktualisiert.`);
        }
      });
    });
  });
});

// Registrierung eines neuen Nutzers mit Passwort-Hashing

export function registriereNutzer(benutzername, email, passwort, callback) {
  const hash = bcrypt.hashSync(passwort, 10);
  const query = `INSERT INTO nutzer (benutzername, email, passwort) VALUES (?, ?, ?)`;

  db.run(query, [benutzername, email, hash], (err) => {
    callback(err);
  });
}

export function pruefeLogin(benutzername, passwort, callback) {
  console.log(`Login-Versuch für: ${benutzername}`); // Debug-Log
  
  db.get('SELECT * FROM nutzer WHERE benutzername = ?', [benutzername], (err, row) => {
    if (err) {
      console.error('Datenbankfehler:', err);
      return callback(err);
    }

    console.log('Gefundener Datensatz:', row); // Zeigt den DB-Eintrag
    
    if (!row) {
      console.log('Benutzer nicht gefunden');
      return callback(null, false);
    }

    console.log('Gespeicherter Hash:', row.passwort); // Debug: Zeigt den gespeicherten Hash
    console.log('Eingegebenes Passwort:', passwort); // Debug
    
    bcrypt.compare(passwort, row.passwort, (err, result) => {
      if (err) {
        console.error('Bcrypt-Fehler:', err);
        return callback(err);
      }
      
      console.log('Passwortvergleich Ergebnis:', result); // Debug
      callback(null, result ? row : false);
    });
  });
}