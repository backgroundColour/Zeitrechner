"use strict";

// Konfiguration
const SCHOOL_DAYS = [1, 2]; // 1 = Montag, 2 = Dienstag
const START_TIME = { h: 7, m: 55 }; // Wann die 1. Stunde BEGINNT

const periods = [
  { label: "1. Stunde", h: 8,  m: 40 },
  { label: "2. Stunde", h: 9,  m: 25 },
  { label: "3. Stunde", h: 10, m: 25 },
  { label: "4. Stunde", h: 11, m: 10 },
  { label: "5. Stunde", h: 12, m: 10 },
  { label: "6. Stunde", h: 12, m: 55 },
  { label: "7. Stunde", h: 13, m: 55 },
  { label: "8. Stunde", h: 14, m: 40 },
];

// Elemente
const elTitle = document.getElementById("MainTitle");
const elText = document.getElementById("TimeDisplay");
const elOpener = document.getElementById("opener");
const elAuto = document.getElementById("autoMode");
const elButtons = document.getElementById("timeButtons");

// Status
let customMode = false;
let customIndex = 0;
let intervalId = null;

// Hilfsfunktionen
function pad2(n) { return String(n).padStart(2, "0"); }

function getDateAt(baseDate, h, m) {
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

// Berechnet das nächste Ziel (Auto-Modus)
function getAutoState(now) {
  const day = now.getDay(); // 0=So, 1=Mo, 2=Di, ...
  const isSchoolDay = SCHOOL_DAYS.includes(day);

  // Fall 1: Heute ist Schultag
  if (isSchoolDay) {
    const startToday = getDateAt(now, START_TIME.h, START_TIME.m);
    
    // A: Vor Schulbeginn
    if (now < startToday) {
      return { 
        target: startToday, 
        title: "Guten Morgen", 
        prefix: "Schulbeginn in" 
      };
    }

    // B: Während der Schule (Prüfe Perioden)
    for (let i = 0; i < periods.length; i++) {
      const pEnd = getDateAt(now, periods[i].h, periods[i].m);
      if (now < pEnd) {
        return { 
          target: pEnd, 
          title: `Verbleibende Zeit der ${i + 1}. Stunde`, 
          prefix: `Noch ... bis ${pad2(periods[i].h)}:${pad2(periods[i].m)}` 
        };
      }
    }
    // C: Nach der letzten Stunde -> Weiter zu "Nächster Schultag"
  }

  // Fall 2: Kein Schultag oder Schule vorbei -> Suche nächsten Start
  let d = new Date(now);
  d.setDate(d.getDate() + 1); // Starte Suche bei morgen
  d.setHours(START_TIME.h, START_TIME.m, 0, 0);

  // Solange weiterspringen, bis wir auf Mo oder Di treffen
  while (!SCHOOL_DAYS.includes(d.getDay())) {
    d.setDate(d.getDate() + 1);
  }

  return { 
    target: d, 
    title: "Nächster Schulbeginn", 
    prefix: "Beginn in" 
  };
}

function render() {
  const now = new Date();
  let state;

  if (customMode) {
    // Manuelle Auswahl simuliert "Während der Stunde"
    let target = getDateAt(now, periods[customIndex].h, periods[customIndex].m);
    if (now > target) target.setDate(target.getDate() + 1); // Falls Zeit schon vorbei, morgen nehmen
    
    state = {
      target: target,
      title: `Manuell: ${customIndex + 1}. Stunde`,
      prefix: "Ende in"
    };
  } else {
    state = getAutoState(now);
  }

  // Zeitdifferenz berechnen
  const diffMs = Math.max(0, state.target - now);
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  // Text zusammenbauen
  let timeString = "";
  if (days > 0) timeString += `${days} Tage `;
  if (days > 0 || hours > 0) timeString += `${hours} Stunden `;
  timeString += `${minutes} Minuten ${seconds} Sekunden`;

  // UI Update
  elTitle.textContent = state.title;
  
  // Spezialfall für "Prefix"-Formatierung
  if (state.prefix.includes("Noch ... bis")) {
     // Ersetze das "..." durch die Zeit
     // Beispiel: "Noch 10 Minuten 5 Sekunden bis 12:00"
     elText.textContent = state.prefix.replace("...", timeString);
  } else {
     // Standard: "Beginn in X Tagen Y Stunden..."
     elText.textContent = `${state.prefix} ${timeString}`;
  }
}

// Buttons erstellen
function initButtons() {
  elButtons.innerHTML = periods.map((p, i) => 
    `<button type="button" onclick="setCustom(${i})">${p.label}</button>`
  ).join("");
}

// Globale Funktionen für HTML-Buttons
window.openList = function(id) { // Name beibehalten für Kompatibilität
  const isHidden = elButtons.hidden;
  elButtons.hidden = !isHidden;
  elOpener.textContent = isHidden ? "Schließen" : "Öffnen";
  elOpener.setAttribute("aria-expanded", !isHidden);
};

window.setCustom = function(index) {
  customMode = true;
  customIndex = index;
  elButtons.hidden = true; // Menü schließen nach Auswahl
  elOpener.textContent = "Öffnen";
  elAuto.hidden = false; // "Auto"-Button zeigen
  render();
};

// Event Listener für Auto-Reset
elAuto.addEventListener("click", () => {
  customMode = false;
  elAuto.hidden = true;
  render();
});

// Start
initButtons();
setInterval(render, 1000);
render(); // Sofort-Update
