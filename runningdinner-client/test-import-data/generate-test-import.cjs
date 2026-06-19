// Run with: node generate-test-import.cjs
// Generates test-participants.xlsx with 80 sample participants matching the import column layout.
// Columns match ExcelParserService.ts COL_MAP exactly (23 columns, indices 0-22).
//
// Partner wish strategy:
//   Option 1 (invitation, col 18 only):  participants 0-9   – mutual invitation pairs (0↔1, 2↔3, …)
//   Option 2 (fixed partner, cols 19-22): participants 10-14 – root row embeds partner data directly
//   No partner wish:                     participants 15-79
'use strict';
// xlsx is provided by the pnpm workspace; resolve it from the monorepo root if not found locally
let XLSX;
try {
  XLSX = require('xlsx');
} catch {
  XLSX = require('../node_modules/.pnpm/xlsx@0.18.5/node_modules/xlsx');
}
const path = require('path');

const MAX_PARTICIPANTS = 80;

const HEADERS = [
  'Vorname', // 0
  'Nachname', // 1
  'E-Mail-Adresse', // 2
  'Geschlecht', // 3
  'Alter', // 4
  'Straße', // 5
  'Hausnummer', // 6
  'PLZ', // 7
  'Stadt', // 8
  'Adresszusatz', // 9
  'Anzahl Sitzplätze', // 10
  'Handy-Nr', // 11
  'Vegetarisch', // 12
  'Vegan', // 13
  'Laktosefrei', // 14
  'Glutenfrei', // 15
  'Essenswünsche (Notiz)', // 16
  'Sonstige Anmerkungen', // 17
  'Teamwunsch E-Mail (Einladung)', // 18 – Option 1: invite an existing/other participant
  'Fester Teampartner: Vorname', // 19 – Option 2: register a new fixed partner in the same row
  'Fester Teampartner: Nachname', // 20 – Option 2
  'Fester Teampartner: E-Mail', // 21 – Option 2 (optional)
  'Fester Teampartner: Handy-Nr', // 22 – Option 2 (optional)
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
function buildEmail(i) {
  return `${pick(firstnames, i).toLowerCase()}.${pick(lastnames, i).toLowerCase()}${i}@example.com`;
}

const rows = [HEADERS];

for (let i = 0; i < MAX_PARTICIPANTS; i++) {
  const fn = pick(firstnames, i);
  const ln = pick(lastnames, i);
  const email = buildEmail(i);
  const gender = i % 3 === 0 ? 'm' : i % 3 === 1 ? 'w' : '';
  const age = String(22 + (i % 40));
  const street = pick(streets, i);
  const streetNr = String(1 + (i % 99));
  const cityIdx = i % cities.length;
  const zip = zips[cityIdx];
  const city = cities[cityIdx];
  const addressRemarks = i % 7 === 0 ? `Wohnung ${i + 1}` : '';
  const mobile = i % 4 === 0 ? `+49 17${i % 10} ${1000000 + i * 7}` : '';
  const vegetarian = bool(i, 6);
  const vegan = bool(i, 11);
  const lactose = bool(i, 13);
  const gluten = bool(i, 17);
  const mealNote = vegan === 'ja' ? 'Bitte kein Fleisch und keine tierischen Produkte' : lactose === 'ja' ? 'Kein Käse bitte' : '';
  const notes = i % 9 === 0 ? 'Komme etwas später' : '';

  // Option 1 and Option 2 are mutually exclusive on the same row.
  // Option 2 root participants require a positive numSeats value.
  let numSeats;
  if (i >= 10 && i < 15) {
    numSeats = '6'; // Option 2 root: must have enough seats for two
  } else {
    numSeats = i % 5 === 0 ? '' : String(2 + (i % 4));
  }

  // col 18: Option 1 – invitation email (leave empty when using Option 2 or no wish)
  let invitationEmail = '';
  // cols 19-22: Option 2 – fixed partner registration (leave empty when using Option 1 or no wish)
  let partnerFirstname = '';
  let partnerLastname = '';
  let partnerEmail = '';
  let partnerMobile = '';

  if (i < 10) {
    // Option 1: mutual invitation pairs (0↔1, 2↔3, 4↔5, 6↔7, 8↔9)
    const partnerId = i % 2 === 0 ? i + 1 : i - 1;
    invitationEmail = buildEmail(partnerId);
  } else if (i >= 10 && i < 15) {
    // Option 2: embed a new fixed partner directly in this row.
    // Use a synthetic index (200+i) to generate unique partner names/emails
    // that don't collide with other participant rows.
    const pIdx = 200 + i;
    partnerFirstname = pick(firstnames, pIdx);
    partnerLastname = pick(lastnames, pIdx);
    if (i % 2 === 0) {
      // Optionally provide partner email
      partnerEmail = `${partnerFirstname.toLowerCase()}.${partnerLastname.toLowerCase()}${pIdx}@example.com`;
    }
    if (i % 3 === 0) {
      // Optionally provide partner mobile
      partnerMobile = `+49 176 ${8000000 + pIdx * 3}`;
    }
  }
  // i >= 15: no partner wish – all partner columns stay empty

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
    invitationEmail, // col 18 – Option 1
    partnerFirstname, // col 19 – Option 2
    partnerLastname, // col 20 – Option 2
    partnerEmail, // col 21 – Option 2
    partnerMobile, // col 22 – Option 2
  ]);
}

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(rows);
XLSX.utils.book_append_sheet(wb, ws, 'Teilnehmer');

const outPath = path.join(__dirname, 'test-participants.xlsx');
XLSX.writeFile(wb, outPath);
console.log(`Written: ${outPath}  (${rows.length - 1} participants)`);
