const utilityFunctions = require("../utils/utilityFunctions");
const middlewares = require('./middlewares');
const userUtils = require('../database/dbaccess/userUtils');
const e = require("express");

module.exports = function(app) {
    app.get("/authresource", middlewares.jwtAuthenticate, (req, res) => {
        res.send("If you can access this, congratulations, you have been logged in.\nAuthinfo: " + JSON.stringify(req.body.authinfo))
    });
//middlewares.secretAuthenticate, 
    app.post("/mail", (req, res) => {
        utilityFunctions.sendMail(req.body).then((v) => {
          res.send(v);
        }).catch((e) => {
          res.send(e);
        });
    });

    app.get("/epochToDate", (req, res) => {
        utilityFunctions.epochToDate(req.query).then((v) => {
          res.send(v)
        }).catch((e) => {
          res.send(e)
        })
    });

  app.post("/users", (_, res) => {
    userUtils.postNewUser({
      username : "myUserName", 
      fullname : "myFullname",
      password : "passwordTest",
      email : "MyMail@mail.com",
      registration : 129389127
    }).then(() => {res.send(JSON.stringify({type:"res", value: "ok"}))}).catch((e) => {res.send(JSON.stringify({type: "err", value: e})) });
  });

  app.delete("/users", (_, res) => {
    userUtils.deleteOneUser("myUserName").then((_) => {res.send("OK")}).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))})
  });

  app.get("/users", (_, res) => {
    userUtils.findUserByName("myUserName").then((user) => {res.send(JSON.stringify(user))}).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))});
  });

  app.get("/testauth", (req, res) => {
    userUtils.validateUser("myUserName", req.query.password).then((v) => {res.send(v)}).catch((e) => {res.send(JSON.stringify({type: "err", value: e}))});
  });

  app.get("/prettyPrint", (req, res) => {
    // TODO:
    //En la query pondría el identificador del caso
    //Se hace una petición a elastic para que recupere la información
    //Se devuelve lo siguiente, donde myqueryresult es el contenido recuperado de elastic
    let myqueryresult = ""
    if(req.query.content){
      myqueryresult = req.query.content
    }
    res.send(`<html><head></head><body><div id="root"></div><script>const jsonobj = ${myqueryresult}</script> <script type="module" src="/scripts/jsonPrettyPrint.js"></script> </body></html>`)
  })
}