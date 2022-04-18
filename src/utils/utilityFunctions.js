nodemailer = require('nodemailer');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2

fs = require('fs');

const accessToken = (oauth2Client) => {
    return new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                console.log("Ha petao aquí")
            reject(err);
            }
            resolve(token);
        });
    });
}


const createTransporter = async () => {
    return new Promise((res, rej) => {
        const oauth2Client = new OAuth2(
            '642067254502-efdoht5rk5d52dscia14pqeu54gaheur.apps.googleusercontent.com',
            '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',
            "https://developers.google.com/oauthplayground"
        );
        oauth2Client.setCredentials({
            refresh_token: '1//04nZiFwW2E5-OCgYIARAAGAQSNwF-L9IrnxbsDiLuozL_W_fJZcH1hiGH0PutLr0SKz0hLUZbZlGv41vt_nMiLZNUXNMGxvuaEW8'
        });
        accessToken(oauth2Client).then((token) => {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  type: "OAuth2",
                  user: 'testsecuora@gmail.com',
                  accessToken: token,
                  clientId: '642067254502-efdoht5rk5d52dscia14pqeu54gaheur.apps.googleusercontent.com',
                  clientSecret: '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',
                  refreshToken: '1//04nZiFwW2E5-OCgYIARAAGAQSNwF-L9IrnxbsDiLuozL_W_fJZcH1hiGH0PutLr0SKz0hLUZbZlGv41vt_nMiLZNUXNMGxvuaEW8'
                }
              });
            
              res(transporter);
        }).catch((e) => {rej(e)})
    });
    
};

const sendEmail = (emailOptions) => {
    return new Promise((res, rej) => {
        createTransporter().then((emailTransporter) => {
            emailTransporter.sendMail(emailOptions).then((v) => res(v))
        }).catch((e) => {rej(e)});
    });
    
};

function sendMail(data) {

    return new Promise((res, rej) => {
        if(!data.user || !data.passwd || !data.server || !data.port || !data.src || !data.dest || !data.sub || !data.msg) {
            rej(JSON.stringify({
              type: "err",
              value: "Required fields: user, passwd, server, port, src, dest, sub, msg..."
            }))
        } else {
            sendEmail({
                subject: data.sub,
                text: data.msg,
                to: data.dest,
                from: "<testsecuora@gmail.com>"
            }).then((v) => res(JSON.stringify({type: "res", value: v}))).catch((e) => {recordLog("[ERROR] - " + e); rej(e)})
/*            transporter = nodemailer.createTransport({
                host: data.server,
                port: Number(data.port),
                secure: true,
                auth: {
                    type: "OAuth2",
                    user: data.user,
                    clientId: '642067254502-efdoht5rk5d52dscia14pqeu54gaheur.apps.googleusercontent.com',
                    clientSecret: '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',
                    refreshToken: '1//04xCEY_u_VKSDCgYIARAAGAQSNwF-L9IrSeIEaxXmH0iazvoEQU5uFICGctsPiBmnmMr0FeuWnueSXE4yJakcrEUdPE9kQCHE_ZE',
                    accessToken: ''
                }
            });
            
            transporter.sendMail({
                from: `<${data.src}>`,
                to: data.dest,
                subject: data.sub,
                text: data.msg
            }).then((v) => {
                recordLog("[INFO] - " + JSON.stringify(v))
                res(JSON.stringify({
                    type: "res",
                    value: v
                }))
            }).catch((e) => {
                recordLog("[ERROR] - " + e)
                rej(JSON.stringify({
                    type: "err",
                    value: e
                }))
            });*/
        }
    });
}

function parseAlert(data) {
    let result = []
    return new Promise((res, rej) => {
        if(data.hits.total.value == undefined) 
            rej("No hits - total - value field found");
        if(Number(data.hits.total.value) == 0)
            res(JSON.stringify(result))
        else {
            if(data.hits.hits == undefined) 
                rej("No hits - total - hits field found")
            data.hits.hits.forEach((e) => {
                let aux = {... e._source}
                aux.contextAlerts = JSON.parse(aux.contextAlerts);
                delete aux.contextAlerts.ecs;
                delete aux.contextAlerts.elastic;
                delete aux.contextAlerts._id;
                delete aux.contextAlerts._index;
                aux.params = JSON.parse(aux.params);
                delete aux.params.license;
                delete aux.params.outputIndex;
                delete aux.params.from;
                delete aux.params.to;
                aux.contextAlerts.kibana.alert.rule.actions.forEach((e) => {
                    delete e.params.documents
                }) 
                aux.ruleTags = aux.ruleTags.split(",").filter((v) => {return (v.charAt(0) != "_")}).join(",");
                result.push(aux);
            });
            res(JSON.stringify(result));
        }
    });
}

function epochToDate(data) {
    return new Promise((res, rej) => {
        if(!data.time){
            res.send(JSON.stringify({
                type: "err",
                value: "true"
            }));
        } else {
            let timestamp = Number(data.time);
            if(data.decrement) {
                timestamp -= Number(data.decrement);
            }
            let date = new Date(timestamp*1000);
            res.send(date.toISOString())
        }
    })
}

function recordLog(msg) {
    let date = new Date();
    filePath = `/home/user/logs/backend-logs/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`;
    fs.appendFile(filePath,`[${date.getHours() < 10 ? "0" + date.getHours().toString() : date.getHours().toString()}:${date.getMinutes() < 10 ? "0" + date.getMinutes().toString() : date.getMinutes().toString()}] ` + String(msg) + "\n", (e) => {if(e) {console.log("Failed to save log: " + e)}});
}

function checkIfConsulted(id) {
    let date = new Date();
    let now = date.getTime();
    filePath = `./src/tmp/recent-alerts.json`;
  
    try{
        //console.log(data)
        let data = fs.readFileSync(filePath, 'utf8');
        if(data == ""){
            data = "{\"visited\": []}";
        }
            
        
        let obj = JSON.parse(data);
        let visited = false
        obj.visited.forEach((v) => {if(v.id == id) visited = true});
        if(visited == true){
            return true
        }
        else{
            obj.visited.push({id: id, date: now});
            let result = obj.visited.filter((e) => {return (Number(e.date) > (now - (600*1000)))});
            fs.writeFileSync(filePath, JSON.stringify({visited: result}));
            return false;
        }
    } catch(err) {recordLog("[ERROR] - On consulting emmited alerts: " + err); return true};
}

module.exports.parseAlert = parseAlert;
module.exports.sendMail = sendMail;
module.exports.epochToDate = epochToDate;
module.exports.recordLog = recordLog;
module.exports.checkIfConsulted = checkIfConsulted;