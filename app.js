"use strict";

const SCHOOL_DAYS = [1, 2];
const WORK_DAYS = [3, 4, 5];
const START_TIME = { h: 7, m: 55 };
const WORK_END_TIME = { h: 16, m: 0 };

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

const elTitle = document.getElementById("MainTitle");
const elText = document.getElementById("TimeDisplay");
const elOpener = document.getElementById("opener");
const elAuto = document.getElementById("autoMode");
const elButtons = document.getElementById("timeButtons");

let customMode = false;
let customIndex = 0;

function pad2(n) { return String(n).padStart(2, "0"); }

function getDateAt(baseDate, h, m) {
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

function getAutoState(now) {
  const day = now.getDay(); 
  
  if (SCHOOL_DAYS.includes(day)) {
    const startToday = getDateAt(now, START_TIME.h, START_TIME.m);
    
    if (now < startToday) {
      return { 
        target: startToday, 
        title: "Guten Morgen", 
        prefix: "Beginn in" 
      };
    }

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
  }

  if (WORK_DAYS.includes(day)) {
    const workEndToday = getDateAt(now, WORK_END_TIME.h, WORK_END_TIME.m);
    if (now < workEndToday) {
      return {
        target: workEndToday,
        title: "Arbeitszeit",
        prefix: `Noch ... bis ${pad2(WORK_END_TIME.h)}:${pad2(WORK_END_TIME.m)}`
      };
    }
  }

  let d = new Date(now);
  d.setDate(d.getDate() + 1); 
  
  while (true) {
    const nextDay = d.getDay();
    if (SCHOOL_DAYS.includes(nextDay)) {
      d.setHours(START_TIME.h, START_TIME.m, 0, 0);
      return { 
        target: d, 
        title: "Nächster Schulbeginn", 
        prefix: "Beginn in" 
      };
    }
    if (WORK_DAYS.includes(nextDay)) {
      d.setHours(WORK_END_TIME.h, WORK_END_TIME.m, 0, 0);
      return { 
        target: d, 
        title: "Nächstes Arbeitsende", 
        prefix: `Noch ... bis ${pad2(WORK_END_TIME.h)}:${pad2(WORK_END_TIME.m)}` 
      };
    }
    d.setDate(d.getDate() + 1);
  }
}

function render() {
  const now = new Date();
  let state;

  if (customMode) {
    let target = getDateAt(now, periods[customIndex].h, periods[customIndex].m);
    if (now > target) target.setDate(target.getDate() + 1);
    
    state = {
      target: target,
      title: `Manuell: ${customIndex + 1}. Stunde`,
      prefix: "Ende in"
    };
  } else {
    state = getAutoState(now);
  }

  const diffMs = Math.max(0, state.target - now);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  let timeString = "";
  if (days > 0) timeString += `${days} Tage `;
  if (days > 0 || hours > 0) timeString += `${hours} Stunden `;
  timeString += `${minutes} Minuten ${seconds} Sekunden`;

  elTitle.textContent = state.title;
  
  if (state.prefix.includes("...")) {
     elText.textContent = state.prefix.replace("...", timeString);
  } else {
     elText.textContent = `${state.prefix} ${timeString}`;
  }
}

function init() {
  elButtons.innerHTML = periods.map((p, i) => 
    `<button type="button" data-index="${i}">${p.label}</button>`
  ).join("");

  elOpener.addEventListener("click", () => {
    const isHidden = elButtons.hidden;
    elButtons.hidden = !isHidden; 
    elOpener.textContent = isHidden ? "Schließen" : "Öffnen";
    elOpener.setAttribute("aria-expanded", !isHidden);
  });

  elButtons.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const idx = Number(e.target.dataset.index);
      customMode = true;
      customIndex = idx;
      
      elButtons.hidden = true;
      elOpener.textContent = "Öffnen";
      elAuto.hidden = false;
      render();
    }
  });

  elAuto.addEventListener("click", () => {
    customMode = false;
    elAuto.hidden = true;
    render();
  });

  setInterval(render, 1000);
  render();
}

init();