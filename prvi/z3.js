import { MongoClient } from "mongodb";
import { CONTINUOUS_COLUMNS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";
const freqCollection = "frekvencija_student-mat-G1-leq-10";

/**
 * 3.	Za svaku kategoričku  vrijednost izračunati frekvencije pojavnosti po obilježjima varijabli
 *  i kreirati novi dokument koristeći nizove,  dokument nazvati:
 *  frekvencija_ {ime vašeg data seta} . Frekvencije računati koristeći $inc modifikator
 */
async function z3() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const freqCol = db.collection(freqCollection);

  // dohvacanje jednog dokumenta za uzorak svih varijabli
  const sample = await collection.findOne({});
  if (!sample) {
    console.log("Nema podataka u kolekciji!");
    await client.close();
    return;
  }

  // kategoricke varijable su sve osim kontinuiranih
  const allVars = Object.keys(sample);
  const categoricalVars = allVars.filter(
    (v) => !CONTINUOUS_COLUMNS.includes(v)
  );

  await freqCol.deleteMany({});

  // racunanje frekvencija za svaku kategoričku varijablu
  for (const varName of categoricalVars) {
    const freqs = {};
    // grupiranje i brojanje pojavljivanja
    const cursor = collection.aggregate([
      { $group: { _id: `$${varName}`, count: { $sum: 1 } } },
    ]);

    for await (const doc of cursor) {
      freqs[doc._id] = doc.count;
    }

    // saveanje kao kao niz parova (vrijednost, broj)
    const freqArr = Object.entries(freqs).map(([val, cnt]) => ({ [val]: cnt }));
    await freqCol.updateOne(
      { varijabla: varName },
      { $set: { pojavnost: freqArr } },
      { upsert: true }
    );
  }

  console.log("Frekvencije spremljene u kolekciju " + freqCollection);
  await client.close();
}

export default z3;
