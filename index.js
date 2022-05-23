const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');


// use middleware 
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;


// MongoDB Client Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.qft8n.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
   const authHeader = req.headers.authorization;
   if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized Access' });
   }
   const token = authHeader.split(' ')[1];
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
         return res.status(403).send({ message: 'Forbidden Access' })
      }
      req.decoded = decoded;
      next();
   });
}


// Running Api From Here
async function run() {
   try {
      await client.connect();

      // Database Name and Collection Name
      const productCollection = client.db('manufacture').collection('products');
      const usersCollection = client.db('manufacture').collection('users');
      const reviewsCollection = client.db('manufacture').collection('reviews');

      // verify admin function to check user role
      const verifyAdmin = async (req, res, next) => {
         const requester = req.decoded.email;
         const requesterAccount = await usersCollection.findOne({ email: requester });
         if (requesterAccount.role === 'admin') {
            next();
         }
         else {
            res.status(403).send({ message: 'Forbidden' });
         }
      }


      // checking admin role
      app.get('/admin/:email', async (req, res) => {
         const email = req.params.email;
         const user = await usersCollection.findOne({ email: email });
         const isAdmin = user.role === 'admin';
         res.send({ admin: isAdmin })
      })


      // Set user into database with authentication
      app.put('/user/:email', async (req, res) => {
         const email = req.params.email;
         const user = req.body;
         const filter = { email: email };
         const options = { upsert: true };
         const updateDoc = {
            $set: user,
         };
         const result = await usersCollection.updateOne(filter, updateDoc, options);
         const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
         res.send({ result, token });
      });

      // Fetching User information
      app.get('/user-info/:email', async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const result = await usersCollection.findOne(query);
         res.send(result);
      });

      // fetch all the products
      app.get('/products', async (req, res) => {
         const cursor = await productCollection.find({}).toArray();
         res.send(cursor);
      });

      // Fetch single product
      app.get('/products/:id', async (req, res) => {
         const id = req.params.id;
         const query = {
            _id: ObjectId(id)
         }
         const result = await productCollection.findOne(query);
         res.send(result);
      });

      // Add review
      app.post('/reviews', async(req, res) => {
         const data = req.body;
         const result = await reviewsCollection.insertOne(data);
         res.send(result);
      });

       // fetch all review
       app.get('/reviews', async(req, res) => {
         const result = await reviewsCollection.find({}).toArray();
         res.send(result);
      });

      // fetch review by particular user
      app.get('/review/:email', async(req, res) => {
         const email = req.params.email;
         const result = await reviewsCollection.find({email: email}).toArray();
         res.send(result);
      });

      // fetch review by particular user
      app.delete('/review/:id', async(req, res) => {
         const id = req.params.id;
         const result = await reviewsCollection.deleteOne({_id: ObjectId(id)});
         res.send(result);
      });

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