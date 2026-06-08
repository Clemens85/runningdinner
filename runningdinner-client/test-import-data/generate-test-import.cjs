// Run with: node generate-test-import.cjs
// Generates test-participants.xlsx with 80 sample participants matching the import column layout.
'use strict';
const XLSX = require('xlsx');
const path = require('path');

const HEADERS = [
  'Vorname',
  'Nachname',
  'E-Mail-Adresse',
  'Geschlecht',
  'Alter',
  'Straße',
  'Hausnummer',
  'PLZ',
  'Stadt',
  'Adresszusatz',
  'Anzahl Sitzplätze',
  'Handy-Nr',
  'Vegetarisch',
  'Vegan',
  'Laktosefrei',
  'Glutenfrei',
  'Essenswünsche (Notiz)',
  'Sonstige Anmerkungen',
  'Teamwunsch E-Mail',
  'Teamwunsch Vorname',
  'Teamwunsch Nachname',
];

const firstnames = [
  'Anna',
  'Ben',
  'Clara',
  'David',
  'Emma',
  'Felix',
  'Greta',
  'Hans',
  'Iris',
  'Jonas',
  'Klara',
  'Leon',
  'Marie',
  'Nico',
  'Olivia',
  'Paul',
  'Queenie',
  'Robert',
  'Sara',
  'Tim',
  'Ursula',
  'Viktor',
  'Wendy',
  'Xaver',
  'Yvonne',
  'Zara',
  'Alina',
  'Bernd',
  'Carla',
  'Dennis',
  'Elke',
  'Frank',
  'Gabriele',
  'Holger',
  'Ingrid',
  'Jan',
  'Karin',
  'Lars',
  'Monika',
  'Norbert',
];
const lastnames = [
  'Müller',
  'Schmidt',
  'Schneider',
  'Fischer',
  'Weber',
  'Meyer',
  'Wagner',
  'Becker',
  'Schulz',
  'Hoffmann',
  'Schäfer',
  'Koch',
  'Bauer',
  'Richter',
  'Klein',
  'Wolf',
  'Schröder',
  'Neumann',
  'Schwarz',
  'Zimmermann',
  'Braun',
  'Krüger',
  'Hofmann',
  'Hartmann',
  'Lange',
  'Schmitt',
  'Werner',
  'Schmitz',
  'Krause',
  'Meier',
  'Lehmann',
  'Schmid',
  'Schulze',
  'Maier',
  'Köhler',
  'Herrmann',
  'König',
  'Walter',
  'Mayer',
  'Huber',
];
const streets = [
  'Hauptstraße',
  'Bahnhofstraße',
  'Gartenweg',
  'Lindenallee',
  'Kirchgasse',
  'Rosenweg',
  'Parkstraße',
  'Bergstraße',
  'Mozartstraße',
  'Schillerstraße',
  'Goethestraße',
  'Fichtenweg',
  'Eichenstraße',
  'Birkenweg',
  'Ahornstraße',
  'Tulpenweg',
  'Marktplatz',
  'Waldstraße',
  'Ringstraße',
  'Dorfstraße',
];
const cities = [
  'Berlin',
  'Hamburg',
  'München',
  'Köln',
  'Frankfurt',
  'Stuttgart',
  'Düsseldorf',
  'Dortmund',
  'Essen',
  'Leipzig',
  'Bremen',
  'Dresden',
  'Hannover',
  'Nürnberg',
  'Duisburg',
  'Bochum',
  'Wuppertal',
  'Bielefeld',
  'Bonn',
  'Münster',
];
const zips = [
  '10115',
  '20095',
  '80331',
  '50667',
  '60311',
  '70173',
  '40213',
  '44135',
  '45127',
  '04109',
  '28195',
  '01067',
  '30159',
  '90402',
  '47051',
  '44777',
  '42103',
  '33602',
  '53111',
  '48143',
];

function pick(arr, i) {
  return arr[i % arr.length];
}
function bool(i, mod) {
  return i % mod === 0 ? 'ja' : '';
}

const rows = [HEADERS];

// Build partner pairs (participants 0&1, 2&3, ... up to index 19 = 10 pairs)
// Remaining 60 have no partner wish.
for (let i = 0; i < 80; i++) {
  const fn = pick(firstnames, i);
  const ln = pick(lastnames, i);
  const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
  const gender = i % 3 === 0 ? 'm' : i % 3 === 1 ? 'w' : '';
  const age = String(22 + (i % 40));
  const street = pick(streets, i);
  const streetNr = String(1 + (i % 99));
  const cityIdx = i % cities.length;
  const zip = zips[cityIdx];
  const city = cities[cityIdx];
  const addressRemarks = i % 7 === 0 ? `Wohnung ${i + 1}` : '';
  const numSeats = i % 5 === 0 ? '' : String(2 + (i % 4));
  const mobile = i % 4 === 0 ? `+49 17${i % 10} ${1000000 + i * 7}` : '';
  const vegetarian = bool(i, 6);
  const vegan = bool(i, 11);
  const lactose = bool(i, 13);
  const gluten = bool(i, 17);
  const mealNote = vegan === 'ja' ? 'Bitte kein Fleisch und keine tierischen Produkte' : lactose === 'ja' ? 'Kein Käse bitte' : '';
  const notes = i % 9 === 0 ? 'Komme etwas später' : '';

  // Team partner wish: pairs among first 20 participants
  let partnerEmail = '';
  let partnerFirstname = '';
  let partnerLastname = '';
  if (i < 20) {
    const partnerId = i % 2 === 0 ? i + 1 : i - 1;
    const pfn = pick(firstnames, partnerId);
    const pln = pick(lastnames, partnerId);
    partnerEmail = `${pfn.toLowerCase()}.${pln.toLowerCase()}${partnerId}@example.com`;
    // Only populate name fields for odd partners (even partners rely on email)
    if (i % 2 !== 0) {
      partnerFirstname = pfn;
      partnerLastname = pln;
    }
  }

  rows.push([
    fn,
    ln,
    email,
    gender,
    age,
    street,
    streetNr,
    zip,
    city,
    addressRemarks,
    numSeats,
    mobile,
    vegetarian,
    vegan,
    lactose,
    gluten,
    mealNote,
    notes,
    partnerEmail,
    partnerFirstname,
    partnerLastname,
  ]);
}

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(rows);
XLSX.utils.book_append_sheet(wb, ws, 'Teilnehmer');

const outPath = path.join(__dirname, 'test-participants.xlsx');
XLSX.writeFile(wb, outPath);
console.log(`Written: ${outPath}  (${rows.length - 1} participants)`);
