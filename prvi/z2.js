import { MongoClient } from "mongodb";
import { CONTINUOUS_COLUMNS } from "./main.js";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";
const statsCollection = "statistika_student-por";

/**
 * 2.	Za svaku kontinuiranu vrijednost izračunati srednju vrijednost,
 * standardnu devijaciju i kreirati novi dokument oblika sa vrijednostima,
 * dokument nazvati:  statistika_ {ime vašeg data seta}. U izračun se uzimaju samo nomissing  vrijednosti .
 *
 * Koristi MongoDB agregacijsku pipeline sa $group, $avg, $stdDevPop, i $sum operatorima
 */
async function z2() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const statsCol = db.collection(statsCollection);

  await statsCol.deleteMany({});

  // svaku kontinuiranu varijablu izračunaj statistiku korištenjem agregacije
  for (const field of CONTINUOUS_COLUMNS) {
    const result = await collection
      .aggregate([
        {
          $match: {
            [field]: { $ne: "-1", $ne: null, $ne: "" }, // filtriraj -1, null i prazne stringove
          },
        },
        {
          $group: {
            _id: null,
            mean: { $avg: { $toDouble: `$${field}` } }, // pretvori u double
            stddev: { $stdDevPop: { $toDouble: `$${field}` } }, // populacijska standardna devijacija
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    if (result.length > 0) {
      await statsCol.insertOne({
        Variable: field,
        statistics: result[0],
      });
    }
  }

  console.log(
    "Statistika je izračunata i spremljena u kolekciju " +
      statsCollection +
      "broj dokumenata: " +
      (await statsCol.countDocuments())
  );
  await client.close();
}

export default z2;
