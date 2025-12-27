import { MongoClient } from "mongodb";
import { CATEGORICAL_COLUMNS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";
const freqCollection = "frekvencija_student-mat-G1-leq-10";
const embCollection = "emb_student-mat-G1-leq-10";

/**
 * 5.Osnovni  dokument  kopirati u novi te embedati vrijednosti
 *  iz tablice 3 za svaku kategoričku vrijednost,
 *  :  emb_ {ime vašeg data seta} }
 */
async function z5() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const freqCol = db.collection(freqCollection);
  const embCol = db.collection(embCollection);

  await embCol.deleteMany({});

  const documents = await collection.find().toArray();

  if (documents.length === 0) {
    console.log("Nema podataka u kolekciji! Prvo pokreni: node main.js load");
    await client.close();
    return;
  }

  for (const doc of documents) {
    let embedDoc = { ...doc };

    // za svaku kategoricku varijablu, embeda frekvencije
    for (const catVar of CATEGORICAL_COLUMNS) {
      // dohvati frekvencijske podatke
      const freqData = await freqCol.findOne({ Varijabla: catVar });

      if (freqData) {
        // Embeda samo frekvencijske podatke
        embedDoc[`${catVar}_frequencies`] = freqData.Pojavnost;
      }
    }

    await embCol.insertOne(embedDoc);
  }

  console.log(
    `Dokumenti sa embedanim frekvencijama su uspješno kreirani u ${embCollection}`
  );
  console.log(`Ukupno dokumenata: ${documents.length}`);

  await client.close();
}

export default z5;
