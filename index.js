//IMPORTS
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require('cors')
const app = express();

//ROutES
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const conversationRoutes = require("./routes/conversations")
const messageRoutes = require("./routes/messages")

//ENV
dotenv.config();

//DB CONNECTION
mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) console.log(err)
    else console.log('Connected to DB...')
  }
);

//MIDDLEWARES
app.use(cors())
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

//use ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);


//SETUP SERVER
app.listen(8800, () => console.log("Server running..."));
