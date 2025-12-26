import fs from "fs";
import csv from "csv-parser";
import { MongoClient } from "mongodb";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";
const csvPath = "./dataset/student-mat-G1-leq-10.csv";

// ucitava csv podatke u mongo db
async function loadData() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  await collection.deleteMany({});
  console.log("Baza je očišćena.");

  const results = [];
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
      results.push(row);
    })
    .on("end", async () => {
      await collection.insertMany(results);
      console.log(
        `CSV podaci su učitani u MongoDB (${results.length} redaka).`
      );
      await client.close();
    });
}

export default loadData;
