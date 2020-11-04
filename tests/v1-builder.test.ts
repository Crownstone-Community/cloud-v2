// import {createUserData} from "./builders/createUserData";
// const MongoClient = require('mongodb').MongoClient;
// //
// // test("populateDatabase", async () => {
// //   for (let i = 0; i < 50; i++) {
// //     console.log("create User", i)
// //     await createUserData()
// //   }
// // }, 50000)
//
// test("DumpDatabase", async () => {
//   // Connection URL
//   const url = 'mongodb://localhost:27017';
//
//   // Create a new MongoClient
//   const client = new MongoClient(url);
//
//   return new Promise(async (resolve, reject) => {
//     // Use connect method to connect to the Server
//     await client.connect()
//     const data_v1 = client.db('data_v1')
//     const users_v1 = client.db('users_v1')
//     await dump(data_v1);
//     await dump(users_v1);
//
//     client.close();
//     resolve()
//   })
// })
// test("CompareDatabase", async () => {
//   // Connection URL
//   const url = 'mongodb://localhost:27017';
//
//   // Create a new MongoClient
//   const client = new MongoClient(url);
//
//   return new Promise(async (resolve, reject) => {
//     // Use connect method to connect to the Server
//     await client.connect()
//     const data_v1 = client.db('data_v1')
//     const users_v1 = client.db('users_v1')
//     await compare(data_v1);
//     await compare(users_v1);
//
//     client.close();
//     resolve()
//   })
// })
//
//
// const fs = require("fs")
// const path = require("path")
// async function dump(db) {
//   let names = await db.listCollections().toArray();
//   for (let i = 0; i < names.length; i++) {
//     let name = names[i].name;
//     const collection = db.collection(name);
//     let data = await collection.find({}).toArray()
//     fs.writeFileSync(path.join(__dirname, 'ref', name + '.dat'), JSON.stringify(data));
//   }
// }
//
// async function compare(db) {
//   let names = await db.listCollections().toArray();
//   for (let i = 0; i < names.length; i++) {
//     let name = names[i].name;
//     const collection = db.collection(name);
//     let data = await collection.find({}).toArray()
//     let str = JSON.stringify(data);
//     let content = fs.readFileSync(path.join(__dirname, 'ref', name + '.dat'), 'utf-8');
//     if (str != content) {
//       throw "MISMATCH"
//     }
//     else {
//       console.log(name, "MATCH")
//     }
//   }
// }