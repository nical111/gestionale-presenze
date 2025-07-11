// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Pages/Dashboard';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

function App() {
  const [utente, setUtente] = useState(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    const recuperaSessione = async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        try {
          const sessionRef = doc(db, 'sessioni', sessionId);
          const sessionSnap = await getDoc(sessionRef);

          if (sessionSnap.exists()) {
            const dati = sessionSnap.data();

            const timestamp = new Date(dati.timestamp);
            const oraAttuale = new Date();
            const differenzaMs = oraAttuale - timestamp;
            const differenzaOre = differenzaMs / (1000 * 60 * 60);

            if (differenzaOre > 24) {
              console.warn('⌛ Sessione scaduta. Rimuovo...');
              await deleteDoc(sessionRef);
              localStorage.removeItem('sessionId');
            } else {
              setUtente({ nome: dati.nome, ruolo: dati.ruolo });
              console.log('✅ Sessione attiva:', dati);
            }
          } else {
            console.warn('❌ Sessione non trovata. Pulizia...');
            localStorage.removeItem('sessionId');
          }
        } catch (err) {
          console.error('Errore nel recupero sessione:', err);
        }
      }
      setCaricamento(false);
    };

    recuperaSessione();
  }, []);

  const handleLogout = async () => {
    console.log("🔓 Logout eseguito");
    const sessionId = localStorage.getItem('sessionId');

    if (sessionId) {
      try {
        await deleteDoc(doc(db, 'sessioni', sessionId));
        console.log('🧹 Sessione rimossa da Firestore');
      } catch (err) {
        console.warn('⚠️ Errore durante la cancellazione della sessione:', err);
      }
      localStorage.removeItem('sessionId');
    }

    setUtente(null);
  };

  if (caricamento) return <div className="loading">Caricamento...</div>;

  return (
    <div className="app-wrapper" style={{ padding: 30, color: 'white' }}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              utente ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={setUtente} />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              utente ? (
                <Dashboard utente={utente} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="*"
            element={<div>📄 Pagina non trovata</div>}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
