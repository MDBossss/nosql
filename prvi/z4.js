import { MongoClient } from "mongodb";
import { CONTINUOUS_COLUMNS } from "./main.js";
import { ObjectId } from "mongodb";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";
const statistika1Collection = "statistika1_student-mat-G1-leq-10";
const statistika2Collection = "statistika2_student-mat-G1-leq-10";
const statsCollection = "statistika_student-mat-G1-leq-10";

/**
 * 4.	Iz osnovnog  dokumenta kreirati dva nova dokumenta sa kontinuiranim vrijednostima
 *  u kojoj će u prvom dokumentu   biti sadržani svi elementi <= srednje vrijednosti,
 *  a u drugom dokumentu biti sadržani svi elementi >srednje vrijednosti,
 *  dokument nazvati:  statistika1_ {ime vašeg data seta} i  statistika2_ {ime vašeg data seta}
 */
async function z4() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const stat1Col = db.collection(statistika1Collection);
  const stat2Col = db.collection(statistika2Collection);
  const statsCol = db.collection(statsCollection);

  await stat1Col.deleteMany({});
  await stat2Col.deleteMany({});

  // prolaz kroz sve kontinuirane varijable
  for (const field of CONTINUOUS_COLUMNS) {
    // srednja vrijednost iz statistika kolekcije
    const result = await statsCol.findOne({ Variable: field });

    if (!result || !result.statistics) {
      console.log(`Nema statistike za ${field}. Pokeni prvo: node main.js -z2`);
      continue;
    }

    const avgValue = result.statistics.mean;

    // inicijalizacije dokumenata sa pocetnim vrijednostima
    await stat1Col.insertOne({
      _id: new ObjectId(),
      variable: field,
      mean_value: avgValue,
      count: 0,
      values: [],
    });

    await stat2Col.insertOne({
      _id: new ObjectId(),
      variable: field,
      mean_value: avgValue,
      count: 0,
      values: [],
    });

    // iteriranje kroz sve retke i raspored vrijednosti u dvije kolekcije
    const cursor = collection.find();
    while (await cursor.hasNext()) {
      const document = await cursor.next();

      if (
        document[field] !== undefined &&
        document[field] !== "-1" &&
        document[field] !== ""
      ) {
        const value = parseFloat(document[field]);

        if (!isNaN(value)) {
          if (value <= avgValue) {
            // vrijednost je <= srednja vrijednost
            await stat1Col.updateOne(
              { variable: field },
              {
                $inc: { count: 1 },
                $push: { values: value },
              }
            );
          } else {
            // vrijednost je > srednja vrijednost
            await stat2Col.updateOne(
              { variable: field },
              {
                $inc: { count: 1 },
                $push: { values: value },
              }
            );
          }
        }
      }
    }
  }

  console.log("Dokumenti su uspješno podijeljeni u dvije kolekcije!");
  console.log(`${statistika1Collection}: vrijednosti <= srednja vrijednost`);
  console.log(`${statistika2Collection}: vrijednosti > srednja vrijednost`);

  await client.close();
}

export default z4;
