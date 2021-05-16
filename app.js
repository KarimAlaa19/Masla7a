
const mongoose = require("mongoose");
const userRoute = require('./routes/user');
const conversationRoute = require('./routes/conversation');
const socketIO = require("socket.io");
const socketIOJwt = require("socketio-jwt");
const { Conversation } = require("./models/conversation");
const { Message } = require("./models/messages");
const { User } = require("./models/user");
const {handlingError, serverErrorHandler} = require('./controllers/error')
const config = require("config");
const cors = require('cors');

const express = require("express");

const app = express();

app.use(cors());

app.use(express.json());
app.use('/user', userRoute);
app.use('/conversations',conversationRoute);
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
