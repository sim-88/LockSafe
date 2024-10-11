const express = require('express')
const app = express()
const port = 3000
const dotenv=require('dotenv')
dotenv.config()
const { MongoClient } = require('mongodb');
// console.log(process.env) 
// const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
// Database Name
const dbName = 'locksafe';
app.get('/', async(req, res) => {
  const findResult = await collection.find({}).toArray();
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})