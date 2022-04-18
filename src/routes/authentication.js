const jwt = require('jsonwebtoken');
const userUtils = require('../database/dbaccess/userUtils');

const authSecret = 'aJDvksKOndi21FKDSasvbniopADpvi';

module.exports = function(app) {
    
  
  app.post("/users/auth", (req, res) => {
    try {
      if (!req.query.content) {
        throw new Error("User request must have content field");
      } else {
        let buff = new Buffer(req.query.content, "base64");
        let auxArr = buff.toString("ascii").split(":");

        /*if(auxArr[0] == user && auxArr[0] == passwd){
          let token = jwt.sign({username: auxArr[0]}, authSecret, {});
          res.send(JSON.stringify({
            type: "res",
            status: "true",
            authToken : token,
            msg: "User logged in"
          }));
        } else {
          res.send(JSON.stringify({
            type: "res",
            status: "false",
            msg: "Wrong user or password"
          }));
        }*/
        userUtils.validateUser(auxArr[0], auxArr[1]).then((value) => {
          if (value == true) {
            let token = jwt.sign({username: auxArr[0]}, authSecret, {expiresIn: "2h"});
            res.send(JSON.stringify({
              type: "res",
              status: "true",
              authToken : token,
              msg: "User logged in"
            }));
          } else {
            res.send(JSON.stringify({
              type: "res",
              status: "false",
              msg: "Wrong user or password"
            }));
          }
        }).catch((e) => {
          throw e;
        })
      }
    } catch (err) {
      res.send(JSON.stringify({
        type: "err",
        msg: "Request not valid: " + err
      }));
    }
  });


}