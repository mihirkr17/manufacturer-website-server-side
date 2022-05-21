const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
// use middleware 
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;


// MongoDB Client Connect
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.qft8n.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// Running Api From Here
async function run() {
   try {
      await client.connect();
   } finally {

   }
}
run().catch(console.dir());



app.get('/', (req, res) => {
   res.send('Manufacture Site Running');
});

app.listen(port, () => {
   console.log('Server running in ' + port);
})