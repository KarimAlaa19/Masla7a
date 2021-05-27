
const mongoose = require("mongoose");
const authRouter = require('./routes/user-auth-routes');
//const categoryRouter = require('./routes/category-routes');
const conversationRouter = require('./routes/conversation');
const adminRoute = require('./routes/admin')
const userProfile = require('./routes/profile');
const {handlingError, serverErrorHandler} = require('./controllers/error')
const config = require("config");
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');
const express = require("express");

const app = express();

var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

const swaggerOptions={
  definition:{
      openapi:'3.0.0',
      info:{
          title: "Masla7a API's Library",
          version:'1.0.0',
          servers:["http://localhost:3000"]
      }
  },
  apis:["./routes/*"]
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));

app.use(express.json());
app.use('/admin/control',adminRoute);
app.use('/accounts', authRouter);
app.use('/my-profile', userProfile);
app.use('/conversations',conversationRouter);
//app.use('/categories', categoryRouter);
app.use(handlingError,serverErrorHandler)
app.use(serverErrorHandler)

const port = process.env.PORT || 3000;
const uri = 
   "mongodb+srv://masla7a_team:TcFX4tnzWH8HlQZq@cluster0.7ygwl.mongodb.net/maslaha?retryWrites=true&w=majority";

if (!config.get("jwtPrivateKey")) {
  console.log("This is FATAL, Private key is not defined");
  process.exit(1);
}
mongoose
  .connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to MongoDB...");
    const server = app.listen(port, console.log(`Listening to port ${port}`));
      
    server.on("error", function (err) {
      console.error(err.message.red);
    });

  
 require("./socketServer").socketServer(server);
  })
  .catch((err) => console.log(err.message));
