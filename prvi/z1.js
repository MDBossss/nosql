import fs from "fs";
import csv from "csv-parser";
import { MongoClient } from "mongodb";
import { CONTINUOUS_VARS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";

// 1.	Sve nedostajuće vrijednosti kontinuirane varijable zamijeniti sa -1, a kategoričke sa „empty“.
async function z1() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  await collection.deleteMany({});

  const results = [];
  let missingCount = 0;

  fs.createReadStream("./dataset/student-mat-G1-leq-10.csv")
    .pipe(csv())
    .on("data", (row) => {
      for (const key in row) {
        if (row[key] === "" || row[key] === undefined || row[key] === null) {
          missingCount++;
          if (CONTINUOUS_VARS.includes(key)) {
            row[key] = -1;
          } else {
            row[key] = "empty";
          }
        }
      }
      results.push(row);
    })
    .on("end", async () => {
      await collection.insertMany(results);
      console.log("Podaci su uspješno uneseni u MongoDB!");
      console.log(`Broj nedostajućih vrijednosti: ${missingCount}`);
      await client.close();
    });
}

export default z1;
