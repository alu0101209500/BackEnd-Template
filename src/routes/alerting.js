const hostslist = require ("../utils/hosts");
const utilityFunctions = require("../utils/utilityFunctions");
const queries = require("../utils/queries");
const middlewares = require('./middlewares');

const https = require('https');
fetch = require('node-fetch');

module.exports = function(app) {
    app.get("/alerts", middlewares.secretAuthenticate, (req, res) => {
        let bodystr = "";
        if(!req.query.time){
          bodystr = JSON.stringify(
            queries.obtain.get_all_alerts()      
          );
        } else {
          let timestamp = Number(req.query.time);
          if(req.query.decrement) {
            timestamp -= Number(req.query.decrement);
          }
          let date = new Date(timestamp*1000);
          bodystr = JSON.stringify(
            queries.obtain.get_recent_alerts(date.toISOString())
          )
        }
      
        const httpsAgent = new https.Agent({
          rejectUnauthorized: false,
        });
        fetch(`${hostslist.hosts.elasticsearch_host}/alerts/_search`, {
          method: "post",
          headers: {
            'Accept': "*/*",
            'Content-Type': "application/json",
            'Authorization': "Basic " + Buffer.from("elastic:7fGqvvpsimv29cRGPboS").toString('base64')
          },
          body: bodystr,
          agent: httpsAgent
        }).then(response => response.json()).then((data) => {
          utilityFunctions.parseAlert(data).then((parsed_data) => {
            let aux = JSON.parse(parsed_data);
            if(aux.length > 0){
              aux = [... aux.filter((e) => {return !utilityFunctions.checkIfConsulted(e.alertId + e.timestamp)})]
              console.log(aux);
              aux.forEach((alert) => {
                utilityFunctions.recordLog("[INFO] - Elastic Alert emitted: " + String(alert.ruleName));
              });
            }
            
            res.send(JSON.stringify(aux));
          }).catch((e) => {
            utilityFunctions.recordLog("[ERROR] - " + e);
            res.send(JSON.stringify({type: "err", value: e}));
          });
        }).catch((e) => {
          utilityFunctions.recordLog(`[FATAL ERROR] - In fetch: ${e}`);
          res.send(JSON.stringify({type: "err", value: e}));
        })
    });
}