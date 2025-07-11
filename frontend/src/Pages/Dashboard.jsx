import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Dashboard({ utente, onLogout }) {
  if (!utente) return <div>Utente non definito</div>;

  const giorniSettimana = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

  const getInizioSettimana = (data) => {
    const giorno = data.getDay();
    const differenza = data.getDate() - giorno + (giorno === 0 ? -6 : 1);
    return new Date(data.setDate(differenza));
  };

  const [settimanaCorrente, setSettimanaCorrente] = useState(getInizioSettimana(new Date()));
  const [activeSlot, setActiveSlot] = useState(null);
  const [blocchiSlot, setBlocchiSlot] = useState({});
  const [menuAperto, setMenuAperto] = useState(false);

  useEffect(() => {
    const caricaBlocchi = async () => {
      try {
        const snapshot = await getDocs(collection(db, "blocchi"));
        const blocchiDaDb = {};
        snapshot.forEach((doc) => {
          blocchiDaDb[doc.id] = doc.data().bloccato;
        });
        setBlocchiSlot(blocchiDaDb);
      } catch (error) {
        console.error("Errore nel caricamento blocchi:", error);
      }
    };

    caricaBlocchi();
  }, []);

  const cambiaSettimana = (offset) => {
    const nuovaData = new Date(settimanaCorrente);
    nuovaData.setDate(nuovaData.getDate() + offset * 7);
    setSettimanaCorrente(nuovaData);
  };

  const getDateOfSettimana = (inizioSettimana) => {
    return Array.from({ length: 5 }, (_, i) => {
      const giorno = new Date(inizioSettimana);
      giorno.setDate(inizioSettimana.getDate() + i);
      return giorno;
    });
  };

  const settimanaDate = getDateOfSettimana(settimanaCorrente);
  const meseAnno = settimanaCorrente.toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  const handleSlotClick = (dayIndex, time) => {
    const slotId = `${dayIndex}-${time}`;
    setActiveSlot(activeSlot === slotId ? null : slotId);
  };

  const toggleBlocco = async (slotId) => {
    const nuovoStato = !blocchiSlot[slotId];
    setBlocchiSlot((prev) => ({ ...prev, [slotId]: nuovoStato }));

    try {
      await setDoc(doc(db, "blocchi", slotId), {
        bloccato: nuovoStato,
        utente: utente.nome,
        timestamp: new Date().toISOString(),
      });
      console.log("Slot salvato correttamente su Firestore.");
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
    }
  };

  const statoSlot = {}; // Questo dovrà essere popolato dinamicamente nel progetto completo

  const renderAdminMenu = (slotId) => {
    const bloccato = blocchiSlot[slotId];
    const stato = statoSlot[slotId] || "vuoto";
    const propostoDaUtente = stato === "proposto_da_te";
    const propostoDalCapo = stato === "proposto_dal_capo";
    const confermato = stato === "confermato";

    return (
      <div className="menu-admin">
        {!bloccato && stato === "vuoto" && <button>Proponi</button>}
        {!bloccato && (propostoDalCapo || propostoDaUtente) && <button>Conferma</button>}
        {!bloccato && <button onClick={() => toggleBlocco(slotId)}>Blocca</button>}
        {bloccato && <button onClick={() => toggleBlocco(slotId)}>Sblocca</button>}
        {!bloccato && (propostoDalCapo || propostoDaUtente) && <button>Proponi alternativa</button>}
        {!bloccato && confermato && <button>Elimina conferma</button>}
        {!bloccato && propostoDaUtente && <button>Elimina proposta</button>}
        <button>Commenta</button>
      </div>
    );
  };

  return (
    <div className="dashboard dark-mode">
      <div className="top-bar">
        <button
          className="hamburger-menu"
          onClick={() => setMenuAperto(!menuAperto)}
        >
          ☰
        </button>
        <div className="titolo-centrato">Calendario</div>
      </div>

      {menuAperto && (
        <div className="menu-laterale">
          <button className="menu-voce" onClick={() => setMenuAperto(false)}>Dashboard</button>
          <button className="menu-voce" onClick={onLogout}>Logout</button>
        </div>
      )}

      <div className="navigazione">
        <button className="btn-nav" onClick={() => cambiaSettimana(-1)}>
          ← Settimana precedente
        </button>
        <div className="mese-anno">{meseAnno.charAt(0).toUpperCase() + meseAnno.slice(1)}</div>
        <button className="btn-nav" onClick={() => cambiaSettimana(1)}>
          Settimana successiva →
        </button>
      </div>

      <div className="griglia">
        {giorniSettimana.map((nomeGiorno, index) => (
          <div className="giorno dark-box" key={index}>
            <div className="giorno-header allineato">
              <span className="giorno-nome">{nomeGiorno}</span>
              <span className="giorno-data-inline">{settimanaDate[index].getDate()}</span>
            </div>

            {["Mattina", "Pomeriggio"].map((fascia) => {
              const slotId = `${index}-${fascia}`;
              const isActive = activeSlot === slotId;
              return (
                <div
                  key={fascia}
                  className={`slot ${isActive ? "active" : ""}`}
                  onClick={() => handleSlotClick(index, fascia)}
                >
                  <div className="slot-label">{fascia}</div>
                  {isActive && renderAdminMenu(slotId)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
