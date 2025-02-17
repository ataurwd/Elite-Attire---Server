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
app.use(cors({
  origin: ['http://localhost:5173', 'https://tourism-management-1e7fd.web.app'],
  credentials: true,
}))


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


    // to post product data to the collections
    app.post('/product', async (req, res) => {
        const product = req.body;
        const result = await productCollection.insertOne(product);
        res.send(result);
    });


      // to get all product
      app.get('/products', async (req, res) => {
        const products = await productCollection.find().toArray();
        res.send(products);
      });
    
    // to get single product base on id
    app.get('/products/:id', async (req, res) => {
        const id = req.params.id;
        const product = await productCollection.findOne({ _id: new ObjectId(id) });
      res.send(product);
    });

    // to delete single product fron the database
    app.delete('/products/:id', async (req, res) => {
        const id = req.params.id;
        const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    });


// PUT API to update a product based on its ID
app.put('/products/:id', async (req, res) => {
    try {
        const id = req.params.id; // Get the ID from the request params
        const { productName, category, material, price, description, quantity, image } = req.body; // Get the updated fields

        // Validate if the provided ID is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid product ID format" });
        }

        const updatedProduct = {
          productName,
            category,
            material,
            price,
            description,
            quantity,
            image,
        };

        // Perform the update operation
        const result = await productCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedProduct }
        );

        // Check if the product was found and updated
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


      // to add user data form the database 
      app.post('/user', async (req, res) => {
        const user = req.body;
        // const isExist = { email: user.email }
        // if (isExist) {
        //   return res.status(409).send({ message: "User already exists" });
        // }
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

    // to get data base on the id
    app.get('/allProduct/:id', async (req, res) => {
        const id = req.params.id;
        const order = await orderCollection.findOne({ _id: new ObjectId(id) });
        res.send(order);
    });

    // to delete single product
    app.delete('/allProduct/:id', async (req, res) => {
        const id = req.params.id;
        const order = await orderCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(order);
    });

    // to get data base on the email
    app.get('/allProduct/email/:email', async (req, res) => {
        const userEmail = req.params.email;
        const order = await orderCollection.find({ userEmail }).toArray()
        res.send(order);
    });

    // to get product data base on email
    app.delete('/allProduct/email/:email', async (req, res) => {
        const userEmail = req.params.email;
        const order = await orderCollection.deleteMany({ userEmail })
        res.send(order);
    });

 // Stripe payment endpoint
 app.post('/stripe-payment-add', async (req, res) => {
  try {
    const { price } = req.body;
    const amount = parseInt(price * 1); 

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

    // to get spacific payment data using id
    app.get('/payment/:id', async (req, res) => {
        const id = req.params.id;
        const payment = await paymentInfor.findOne({ _id: new ObjectId(id) });
        res.send(payment);
    });

    // to update order status
    app.patch('/payment/:id', async (req, res) => {
      const orderId = req.params.id;
      const { status } = req.body;
      try {
        // Update the order status in the database
        const result = await paymentInfor.updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { status: status } }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).send({ message: 'Order not found' });
        }
    
        res.send({ message: 'Order status updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
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

