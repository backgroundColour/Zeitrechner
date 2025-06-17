let jetzt = new Date();
let custom = false;
let stunden = jetzt.getHours();
let minuten = jetzt.getMinutes();
let aktuelleZeitInMinuten = stunden * 60 + minuten;
let Hours = [8,9,10,11,12,12,13,14];
let Minutes = [40,25,25,10,10,55,55,40];
let Stunde = 0;
let listOpen = false
for(let i = 0; i < Hours.length; i++) {
    let gepruefteZeitInMinuten = Hours[i] * 60 + Minutes[i];
    if(aktuelleZeitInMinuten < gepruefteZeitInMinuten) {
        Stunde = i;
        break;
    }
}

document.getElementById("timeButtons").classList.add("d-none");
document.getElementById("Zoomable").style.scale = 1.5

function remainingTime(){
    let jetzt = new Date();
    let zielZeit = new Date();
    let uhrZeit = Hours[Stunde] + ":" + Minutes[Stunde];
    zielZeit.setHours(Hours[Stunde]);
    zielZeit.setMinutes(Minutes[Stunde]);
    zielZeit.setSeconds(0);
    
    if (jetzt > zielZeit) {
        zielZeit.setDate(jetzt.getDate() + 1);
        if (custom == false && Stunde != 0){
            Stunde+=1;
        }
    }

    let verbleibendeZeit = zielZeit - jetzt;

    let sekunden = Math.floor((verbleibendeZeit / 1000) % 60);
    let minuten = Math.floor((verbleibendeZeit / 1000 / 60) % 60);
    let stunden = Math.floor((verbleibendeZeit / (1000 * 60 * 60)) % 24);
    
    document.getElementById("Zeit").textContent = "Noch " 
    + stunden + " Stunden " + minuten + " Minuten "
    + sekunden + " Sekunden bis " + uhrZeit;
    document.getElementById("VerbleibendeStunde").textContent = "Verbleibende Zeit der " + (Stunde+1) + ". Stunde" ;

   
}

function openList(id){
    if (listOpen == false){
        listOpen = true
            document.getElementById("opener").innerText = "Schließen"
            document.getElementById("timeButtons").classList.remove("d-none")
            document.getElementById("Zoomable").style.scale = 1
    }else{
        listOpen = false
            document.getElementById("opener").innerText = "Öffnen"
            document.getElementById("timeButtons").classList.add("d-none")
            document.getElementById("Zoomable").style.scale = 1.5
    }
}

function setTime(Time){
    custom = true
    Stunde = Time;
    remainingTime();
}

setInterval(remainingTime, 1000);
