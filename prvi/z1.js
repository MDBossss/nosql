import { MongoClient } from "mongodb";
import { CONTINUOUS_COLUMNS, CATEGORICAL_COLUMNS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";

// 1.	Sve nedostajuće vrijednosti kontinuirane varijable zamijeniti sa -1, a kategoričke sa „empty".
async function z1() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Pripremi update operacije sa $ifNull operatorom
  let updateOps = {};

  // kontinuirane varijable zamijeni s -1
  CONTINUOUS_COLUMNS.forEach((field) => {
    updateOps[field] = { $ifNull: [`$${field}`, -1] };
  });

  // kategoricke varijable zamijeni s "empty"
  CATEGORICAL_COLUMNS.forEach((field) => {
    updateOps[field] = { $ifNull: [`$${field}`, "empty"] };
  });

  // updateMany
  const result = await collection.updateMany({}, [{ $set: updateOps }]);

  console.log("Nedostajuće vrijednosti su uspješno zamijenjene!");
  console.log(`Broj ažuriranih dokumenata: ${result.modifiedCount}`);

  await client.close();
}

export default z1;
