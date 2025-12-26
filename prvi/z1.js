import { MongoClient } from "mongodb";
import { CONTINUOUS_COLUMNS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";

// 1.	Sve nedostajuće vrijednosti kontinuirane varijable zamijeniti sa -1, a kategoričke sa „empty".
async function z1() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // dohvat jednog dokumenta (reda) za dobivanje svih varijabli
  const sample = await collection.findOne({});
  if (!sample) {
    console.log("Nema podataka u kolekciji! Prvo pokreni: node main.js load");
    await client.close();
    return;
  }

  const allColumns = Object.keys(sample);
  const columnsCategorical = allColumns.filter(
    (c) => !CONTINUOUS_COLUMNS.includes(c) && c !== "_id"
  );

  const docs = await collection.find({}).toArray(); // svi dokumenti (redci)
  let missingCount = 0;

  // za svaki dokument (redak)
  for (const doc of docs) {
    let updateObj = {};

    // kontinuirane varijable zamijeni s -1
    for (const c of CONTINUOUS_COLUMNS) {
      if (doc[c] === null || doc[c] === "" || !doc.hasOwnProperty(c)) {
        updateObj[c] = -1;
        missingCount++;
      }
    }

    // kategoricke varijable zamijeni s "empty"
    for (const c of columnsCategorical) {
      if (doc[c] === null || doc[c] === "" || !doc.hasOwnProperty(c)) {
        updateObj[c] = "empty";
        missingCount++;
      }
    }

    // okini update
    if (Object.keys(updateObj).length > 0) {
      await collection.updateOne({ _id: doc._id }, { $set: updateObj });
    }
  }

  console.log("Nedostajuće vrijednosti su uspješno zamijenjene!");
  console.log(`Broj zamijenjenih vrijednosti: ${missingCount}`);

  await client.close();
}

export default z1;
