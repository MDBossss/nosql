import loadData from "./loadData.js";
import z1 from "./z1.js";
import z2 from "./z2.js";
import z3 from "./z3.js";
import z4 from "./z4.js";
import z5 from "./z5.js";
import z6 from "./z6.js";
import z7 from "./z7.js";
import z8 from "./z8.js";

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

export const CATEGORICAL_COLUMNS = [
  "school",
  "sex",
  "address",
  "famsize",
  "Pstatus",
  "Mjob",
  "Fjob",
  "reason",
  "guardian",
  "schoolsup",
  "famsup",
  "paid",
  "activities",
  "nursery",
  "higher",
  "internet",
  "romantic",
];

// potrebno je prvo pokrenuti sa -load da se ucitaju podaci, zatim ostale zadatke
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
  } else if (arg === "-z4") {
    await z4(); // node prvi/main.js -z4
  } else if (arg === "-z5") {
    await z5(); // node prvi/main.js -z5
  } else if (arg === "-z6") {
    await z6(); // node prvi/main.js -z6
  } else if (arg === "-z7") {
    await z7(); // node prvi/main.js -z7
  } else if (arg === "-z8") {
    await z8(); // node prvi/main.js -z8
  } else {
    console.log("neispravan argument: " + arg);
  }
}

main();
