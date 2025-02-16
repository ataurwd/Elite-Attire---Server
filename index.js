require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 5000;
// const stripe = require('stripe')(process.env.STRIP_SECRATE_KEY)
const stripe = require('stripe')("sk_test_51QgVp5RwZ10FIGO8cVVSkE8OQCilQDNZF1Y9Drvhde2BlBoHpkLMC0j8Ysubxnr3uP2tO48WkMhgmU5WzQr4Rmwa00LdcJZYY9")

app.use(express.json());
app.use(cookieParser())
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8oded.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
      
    // create product database 
    const productCollection = client.db("elite").collection("product")
    const userDatabase = client.db("elite").collection("user")
    const orderCollection = client.db("elite").collection("order")
    const paymentInfor = client.db("elite").collection("payment")
    const wishlist = client.db("elite").collection("wishitem")

      // to get all product
      app.get('/products', async (req, res) => {
        const products = await productCollection.find().toArray();
        res.send(products);
      });

      // to add user data form the database 
      app.post('/user', async (req, res) => {
        const user = req.body;
        const isExist = { email: user.email }
        if (isExist) {
          return res.status(409).send({ message: "User already exists" });
        }
        const result = await userDatabase.insertOne(user);
        res.send(result);
      });

      // to get user data form the database by id
      app.get('/users', async (req, res) => {
          const result = await userDatabase.find().toArray();
          res.send(result);
      });

      // to get user base on email
      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userDatabase.findOne({ email });
        res.send(user);
      });
    
    // post order data to the database
    app.post('/order', async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.send(result);
    });

    // to get product data form the database by
    app.get('/allProduct', async (req, res) => {
        const order = await orderCollection.find().toArray()
        res.send(order);
    });

    // to get product data base on email
    app.delete('/allProduct/:email', async (req, res) => {
        const userEmail = req.params.email;
        const order = await orderCollection.deleteMany({ userEmail })
        res.send(order);
    });

 // Stripe payment endpoint
 app.post('/stripe-payment-add', async (req, res) => {
  try {
    const { price } = req.body;
    const amount = parseInt(price * 1); // Stripe expects the amount in cents

    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent', error);
    res.status(500).send({ error: 'Payment failed' });
  }
 });
    
    // to save user payment data
    app.post('/payment', async (req, res) => {
        const payment = req.body;
        const result = await paymentInfor.insertOne(payment);
        res.send(result);
    });

    // get payment data
    app.get('/payment', async (req, res) => {
        const payment = await paymentInfor.find().toArray()
        res.send(payment);
    });


    // add to wishlist
    app.post('/wishlist', async (req, res) => {
      const order = req.body;
      const result = await wishlist.insertOne(order);
      res.send(result);
  });

    // get wishlist data
    app.get('/wishlist', async (req, res) => {
        const result = await wishlist.find().toArray()
        res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome to server');
});
  
app.listen(port);

