import { MongoClient } from "mongodb";

const mongoUrl = "mongodb://localhost:27017";
const dbName = "studentdb";
const collectionName = "students";

/**
8.	Kreirati složeni indeks na originalnoj tablici i osmisliti upit koji je kompatibilan sa indeksom 
 */
async function z8() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  try {
    // složeni indeks: age (descending), sex (ascending)
    const indexName = await collection.createIndex({
      age: -1,
      sex: 1,
    });

    console.log(`slozeni indeks kreiran: ${indexName}`);

    // upit kompatibilan sa indeksom - koristi oba polja u redoslijedu
    const query = { age: { $gte: "17", $lte: "18" }, sex: "M" };
    const result = await collection.find(query).toArray();
    console.log(`Upit: db.students.find(${JSON.stringify(query)})`);
    console.log(`Rezultat: ${result.length} dokumenata\n`);

    // info o indeksima
    console.log("--- INDEKSI NA KOLEKCIJI ---");
    const indexes = await collection.listIndexes().toArray();

    indexes.forEach((index) => {
      console.log(`Indeks: ${index.name}`);
      console.log(`  Polja: ${JSON.stringify(index.key)}`);
    });
  } catch (error) {
    console.error("Greška:", error.message);
  } finally {
    await client.close();
    console.log("Konekcija zatvorena");
  }
}

export default z8;
