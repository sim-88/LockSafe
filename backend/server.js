const express = require('express')
const app = express()
const port = 3000
const dotenv=require('dotenv')
const bodyParser = require('body-parser')
const cors=require('cors')
dotenv.config()

const { MongoClient } = require('mongodb');
// console.log(process.env.MONGO_URI) 
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
// Database Name
const dbName = 'locksafe';

// // Connect to MongoDB
// async function connectDB() {
//   try {
//     await client.connect();
//     console.log("Connected successfully to MongoDB");
//   } catch (err) {
//     console.error("Failed to connect to MongoDB", err);
//   }
// }

// connectDB();
client.connect();

const db = client.db(dbName);
const collection = db.collection('passwords');

app.use(bodyParser.json())
app.use(cors())
// To get all the passwords
app.get('/', async(req, res) => {
  const findResult = await collection.find({}).toArray();
  res.json(findResult)
})

// TO save a password
app.post('/', async(req, res) => {
  const password=req.body;
  const findResult = await collection.insertOne(password);
  res.send({success:true,result:findResult})
})
// TO delete a password by ID
app.delete('/', async(req, res) => {
  const password=req.body;
  const findResult = await collection.deleteOne(password);
  res.send({success:true,result:findResult})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})