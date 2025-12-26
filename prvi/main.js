import loadData from "./loadData.js";
import z1 from "./z1.js";
import z2 from "./z2.js";
import z3 from "./z3.js";

export const CONTINUOUS_COLUMNS = [
  "age",
  "Medu",
  "Fedu",
  "traveltime",
  "studytime",
  "failures",
  "famrel",
  "freetime",
  "goout",
  "Dalc",
  "Walc",
  "health",
  "absences",
  "G1",
  "G2",
  "G3",
];

async function main() {
  const arg = process.argv[2];
  if (arg === "-load") {
    await loadData(); // node prvi/main.js -load
  } else if (arg === "-z1") {
    await z1(); // node prvi/main.js -z1
  } else if (arg === "-z2") {
    await z2(); // node prvi/main.js -z2
  } else if (arg === "-z3") {
    await z3(); // node prvi/main.js -z3
  } else {
    console.log("  -load - učitaj CSV u MongoDB");
    console.log("  -z1   - zamijeni nedostajuće vrijednosti");
    console.log("  -z2   - izračunaj statistiku");
    console.log("  -z3   - izračunaj frekvencije");
  }
}

main();
