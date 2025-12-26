import { MongoClient } from "mongodb";
import { CONTINUOUS_COLUMNS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";
const statsCollection = "statistika_student-mat-G1-leq-10";

/**
 * 2.	Za svaku kontinuiranu vrijednost izračunati srednju vrijednost,
 * standardnu devijaciju i kreirati novi dokument oblika sa vrijednostima,
 * dokument nazvati:  statistika_ {ime vašeg data seta}. U izračun se uzimaju samo nomissing  vrijednosti .
 */
async function z2() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const statsCol = db.collection(statsCollection);

  const docs = await collection.find({}).toArray(); // svi dokumenti (redci)
  const stats = {};

  // svaku kontinuiranu varijablu izračunaj statistiku
  for (const varName of CONTINUOUS_COLUMNS) {
    // filtrirati sve vrijednosti za varijablu, pretvori u broj, filtriraj -1 i NaN
    const values = docs
      .map((doc) => Number(doc[varName]))
      .filter((v) => !isNaN(v) && v !== -1);

    if (values.length === 0) continue; // Preskoči ako nema vrijednosti

    const mean = values.reduce((a, b) => a + b, 0) / values.length; // srednja vrijednost

    const std = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length // standardna devijacija
    );

    stats[varName] = { mean, std, count: values.length };
  }

  await statsCol.deleteMany({});
  await statsCol.insertOne(stats);
  console.log("Statistika spremljena u kolekciju " + statsCollection);
  await client.close();
}

export default z2;
