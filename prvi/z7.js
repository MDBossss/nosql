import { MongoClient } from "mongodb";
import { CONTINUOUS_COLUMNS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const embCollection = "emb2_student-mat-G1-leq-10";

/**
7.	Iz tablice emb2 izvući sve one srednje vrijednosti  iz 
 nizova čija je standardna devijacija 10% > srednje vrijednosti 
 koristeći $set modifikator
 */
async function z7() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const embCol = db.collection(embCollection);

  const documentsToUpdate = await embCol.find().toArray();

  if (documentsToUpdate.length === 0) {
    console.log(
      "Nema podataka u emb2 kolekciji! Prvo pokreni: node main.js -z6"
    );
    await client.close();
    return;
  }

  let updatedCount = 0;

  for (const doc of documentsToUpdate) {
    // za svaku kontinuiranu varijablu
    for (const field of CONTINUOUS_COLUMNS) {
      const statsKey = `${field}_stats`;

      if (
        doc[statsKey] &&
        doc[statsKey].standardDeviation &&
        doc[statsKey].average
      ) {
        // provjera je li standardna devijacija > 10% od srednje vrijednosti
        const threshold = 1.1 * doc[statsKey].average;
        const isExceeding = doc[statsKey].standardDeviation > threshold;

        //  $set za dodavanje markera
        await embCol.updateOne(
          { _id: doc._id },
          {
            $set: {
              [`${field}_exceeding_threshold`]: isExceeding,
            },
          }
        );

        updatedCount++;
      }
    }
  }

  console.log("Dokumenti su ažurirani sa markerima za prekoračenja!");
  console.log(`Ukupno ažuriranih polja: ${updatedCount}`);

  await client.close();
}

export default z7;
