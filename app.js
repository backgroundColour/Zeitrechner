"use strict";

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

const elTitle = document.getElementById("VerbleibendeStunde");
const elText = document.getElementById("Zeit");
const elOpener = document.getElementById("opener");
const elAuto = document.getElementById("autoMode");
const elButtons = document.getElementById("timeButtons");

let custom = false;
let customIndex = 0;
let intervalId = null;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function buildButtons() {
  elButtons.innerHTML = periods
    .map((p, i) => `<button type="button" data-index="${i}">${p.label}</button>`)
    .join("");
}

function setListOpen(open) {
  elOpener.textContent = open ? "Schließen" : "Öffnen";
  elOpener.setAttribute("aria-expanded", String(open));
  elButtons.hidden = !open;
}

function endDateFor(index, now) {
  const d = new Date(now);
  d.setHours(periods[index].h, periods[index].m, 0, 0);
  return d;
}

function nextAutoTarget(now) {
  for (let i = 0; i < periods.length; i++) {
    const end = endDateFor(i, now);
    if (now < end) return { index: i, target: end };
  }
  // Nach der 8. Stunde: nächste Zielzeit = morgen 1. Stunde
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const first = endDateFor(0, tomorrow);
  return { index: 0, target: first };
}

function render() {
  const now = new Date();

  const { index, target } = custom
    ? (() => {
        let t = endDateFor(customIndex, now);
        if (now >= t) {
          t = endDateFor(customIndex, new Date(now.getTime() + 24 * 60 * 60 * 1000));
        }
        return { index: customIndex, target: t };
      })()
    : nextAutoTarget(now);

  const diffMs = Math.max(0, target - now);
  const s = Math.floor((diffMs / 1000) % 60);
  const m = Math.floor((diffMs / (1000 * 60)) % 60);
  const h = Math.floor(diffMs / (1000 * 60 * 60));

  const uhrZeit = `${pad2(periods[index].h)}:${pad2(periods[index].m)}`;

  elTitle.textContent = `Verbleibende Zeit der ${index + 1}. Stunde`;
  elText.textContent = `Noch ${h} Stunden ${m} Minuten ${s} Sekunden bis ${uhrZeit}`;
}

function start() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(render, 1000);
  render();
}

buildButtons();
setListOpen(false);
start();

// UI Events (ohne inline onclick) – besser wartbar. [web:1][web:5]
elOpener.addEventListener("click", () => {
  setListOpen(elButtons.hidden); // toggle
});

elAuto.addEventListener("click", () => {
  custom = false;
  setListOpen(false);
  render();
});

elButtons.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-index]");
  if (!btn) return;
  custom = true;
  customIndex = Number(btn.dataset.index);
  setListOpen(false);
  render();
});

// Optional: Interval pausieren wenn Tab nicht sichtbar (spart Ressourcen).
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (intervalId) clearInterval(intervalId); // clearInterval beendet ein setInterval. [web:15]
    intervalId = null;
  } else {
    start();
  }
});
