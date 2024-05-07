const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://myadmin:5ztGfkJGyTAMInAB@cluster0.ty9m6.mongodb.net/?retryWrites=true&w=majority";
const mongoClient = new MongoClient(uri, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
    minPoolSize: 1,
    maxPoolSize: 20
  }
);

module.exports = Object.freeze({
  mongoClient: mongoClient
});

