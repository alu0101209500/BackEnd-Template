const express = require('express');
const cors = require('cors');
const join = require('path').join;
const mongoose = require('mongoose');
const database = require('../config/database').database
const utilityFunctions = require("./utils/utilityFunctions");

const app = express();

mongoose.connect(database.remoteUrl , {useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,}).then(()=>{
    utilityFunctions.recordLog(`[INFO] - Connection to database ${database.remoteUrl} established.`)
  }).catch((err) => {
    utilityFunctions.recordLog("[ERROR] - On database connection: " + err);
    console.log("[ERROR] - On database connection: " + err);
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));
app.use(cors());

require('./routes/alerting')(app);
require('./routes/authentication')(app);
require('./routes/utilities')(app);

app.get("/script/:path", (req, res) => {
  res.sendFile("/scripts" + req.originalUrl);
});

app.get("/:path", (req, res) => {
  console.log(req.originalUrl);
  if(req.originalUrl == "/"){
    res.sendFile("/index.html");
  }
  res.sendFile(req.originalUrl);
});

app.get("*", (req, res) => {
  res.status(404).send("<html><head></head><body><h1>Error 404</h1><br><p>Page not found</p></body></html>")
});

app.listen(6969, "192.168.2.17", () => {
  console.log("Server a la escucha en el puerto 6969");
  utilityFunctions.recordLog(`[INFO] - Server started at ${new Date().toString()}`);
});