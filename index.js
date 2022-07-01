const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Emma-john server is running');
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkujq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("emmajohn").collection("product");
        console.log('emmajohn DB is running')
        // find all data from Db and send to client side
        app.get('/product', async (req, res) => {
            console.log(req.query)
            const page = parseInt(req.query.page);
            const itemsCount = parseInt(req.query.items);
            const query = {};
            const cursor = productCollection.find(query);

            // send data based on page number and itemsToShow count
            let products;
            if (page || itemsCount) {
                /* see below code to understand how to calculate skip */
                // page 0 : Need to skip- pageNumber(0)*10 items and will send 0-10 number item
                // page 1 : Need to skip- pageNumber(1)*10  items and will send 11-20 number item
                // page 2 : Need to skip- pageNumber(2)*10 items and will send 21-30 number item
                // page 3 : Need to skip- pageNumber(3)*10 items and will send 31-40 number item .....
                products = await cursor.skip(page * 10).limit(itemsCount).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            res.send(products);
        });

        // find total data count saved in the database and send to client side
        app.get('/productCount', async (req, res) => {
            const dataCount = await productCollection.countDocuments();
            res.send({ dataCount });
        });
        // POST request to get products by _id
        app.post('/productByKeys', async (req, res) => {
            const keys = req.body;
            const savedIds = keys.map(id => ObjectId(id));
            const query = { _id: { $in: savedIds } } /* search $in mongoDB in google and read articles */
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            console.log(keys)
            res.send(products);


        })
    }
    finally {

    }
};
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Emma-john-server is running at port : ${port}`);
});


