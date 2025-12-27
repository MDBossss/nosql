import { MongoClient } from "mongodb";
import { CONTINUOUS_COLUMNS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";
const statsCollection = "statistika_student-mat-G1-leq-10";
const embCollection = "emb2_student-mat-G1-leq-10";

/**
 *6.	Osnovni  dokument  kopirati u novi te embedati vrijednosti iz tablice 2
  za svaku kontinuiranu  vrijednost kao niz :  emb2_ {ime vašeg data seta} 
 */
async function z6() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const statsCol = db.collection(statsCollection);
  const embCol = db.collection(embCollection);

  await embCol.deleteMany({});

  const documents = await collection.find({}).toArray();

  if (documents.length === 0) {
    console.log("Nema podataka u kolekciji! Prvo pokreni: node main.js load");
    await client.close();
    return;
  }

  for (const baseDoc of documents) {
    let embeddedDoc = { ...baseDoc };

    // za svaku kontinuiranu varijablu
    for (const field of CONTINUOUS_COLUMNS) {
      // dohvati statisticke podatke
      const statsData = await statsCol.findOne({ Variable: field });

      if (statsData) {
        embeddedDoc[`${field}_stats`] = {
          average: statsData.statistics.mean,
          standardDeviation: statsData.statistics.stddev,
          nonMissingCount: statsData.statistics.count,
        };
      }
    }

    await embCol.insertOne(embeddedDoc);
  }
  console.log(`Ukupno dokumenata: ${documents.length}`);

  await client.close();
}

export default z6;
