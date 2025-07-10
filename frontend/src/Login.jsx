import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');

  const handleLogin = async () => {
    setErrore('');

    try {
      const userRef = doc(db, 'utenti', username);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setErrore('Utente non trovato');
        return;
      }

      const datiUtente = userSnap.data();

      if (datiUtente.password !== password) {
        setErrore('Password errata');
        return;
      }

      // ✅ CREA LA SESSIONE su Firestore
      const sessionId = uuidv4();
      await setDoc(doc(db, 'sessioni', sessionId), {
        nome: username,
        ruolo: datiUtente.ruolo,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
      });

      // ✅ SALVA L’ID DELLA SESSIONE nel localStorage
      localStorage.setItem('sessionId', sessionId);

      // ✅ NOTIFICA IL COMPONENTE PADRE
      onLogin({ nome: username, ruolo: datiUtente.ruolo });
    } catch (err) {
      console.error('Errore nel login:', err);
      setErrore('Errore nel login. Riprova.');
    }
  };

  return (
    <div className="login-box">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Nome utente"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Accedi</button>
      {errore && <p style={{ color: 'red', marginTop: '12px' }}>{errore}</p>}
    </div>
  );
}

export default Login;
