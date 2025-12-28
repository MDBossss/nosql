import { MongoClient } from "mongodb";
import { CONTINUOUS_COLUMNS, CATEGORICAL_COLUMNS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";
const freqCollection = "frekvencija_student-por";

/**
 *3.	Za svaku kategoričku  vrijednost izračunati frekvencije pojavnosti
  po obilježjima varijabli i kreirati novi dokument koristeći nizove,
  dokument nazvati:  frekvencija_ {ime vašeg data seta}. 
  Frekvencije računati koristeći $inc modifikator. 
 */
async function z3() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const freqCol = db.collection(freqCollection);

  await freqCol.deleteMany({});

  const documents = await collection.find().toArray();

  // batch update operacije
  const bulkOps = [];

  for (const doc of documents) {
    for (const field of CATEGORICAL_COLUMNS) {
      const value = doc[field];
      if (value !== undefined && value !== null && value !== "") {
        bulkOps.push({
          updateOne: {
            filter: { Varijabla: field },
            update: { $inc: { [`frequencies.${value}`]: 1 } },
            upsert: true,
          },
        });
      }
    }
  }

  if (bulkOps.length > 0) {
    await freqCol.bulkWrite(bulkOps);
  }

  // Transformacija u array format
  const stats = await freqCol.find({}).toArray();

  const transformedDocs = stats.map((stat) => {
    const freqArray = Object.entries(stat.frequencies || {}).map(
      ([val, cnt]) => ({ [val]: cnt })
    );

    return {
      Varijabla: stat.Varijabla,
      Pojavnost: freqArray,
    };
  });

  await freqCol.deleteMany({});
  await freqCol.insertMany(transformedDocs);

  console.log(`Frekvencije spremljene u ${freqCollection}`);
  await client.close();
}

export default z3;
