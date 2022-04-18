let globalObj = {};

let isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};

let isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("root").style.width = "60%";
    document.getElementById("root").style.marginLeft = "20%";
    document.getElementById("root").style.borderStyle = "solid"
    document.getElementById("root").style.borderColor = "grey";

    if(!jsonobj)
        alert("No JSON obj detected");
    else{
        
        //tab = &emsp
        let myObj = JSON.parse(jsonobj);
        console.log(myObj);
        globalObj = {...myObj};
        getList("", myObj, 0);
        let content = "<table style=\"width: 100%;cursor: default\">" + reccall("", myObj, 0) + "</table>";
        document.getElementById("root").innerHTML = content;
        setListeners(myObj);
    }
});
function reccall(father, obj, lvl){
    let result = "";
    if(isObject(obj) || isArray(obj)) {
        for(let prop in obj){
            result += `<tr ${(lvl%2==1)?"style=\"background-color: lightgrey\"":""}><td>`;
            for(let i = 0; i < lvl; i++){
                result += "&emsp;&emsp;"
            }
            if(String(obj[prop]).slice(0, 15) != "[object Object]") {
                
                result += String(prop) + ": ";
                result += String(obj[prop])
            } else {
                if(propList[lvl]) {
                    if(propList[lvl][father + prop] == true) {
                        result += `<span href="" id="${lvl}.${father}${prop}"><p style=\"color: #434544;display: inline\">&#9660;</p> ${String(prop)}</span>`
                    } else {
                        result += `<span href="" id="${lvl}.${father}${prop}"><p style=\"color: #434544;display: inline\">&#9654;</p> ${String(prop)}</span>`
                    }
                }
            }
            result += "</td></tr>";
            if(propList[lvl]) {
                if(propList[lvl][father + prop] == true)
                    result += reccall(father + prop + "_", obj[prop], lvl+1);
           }
        }
        return result;
    } else {
        return "";
    }
}

let propList = {};
let elements = [];
function getList(father, obj, lvl) {
    if(!propList[lvl]){
        propList[lvl] = {}
    }
    if(isObject(obj) || isArray(obj)) {
        for(let prop in obj){
            if(String(obj[prop]).slice(0, 15) == "[object Object]") {
                propList[lvl][father + prop] = true;
                getList(father + prop + "_", obj[prop], lvl+1);
            }
        }
        return;
    } else {
        return;
    }
}

function setListeners(obj) {
    setListenersRec("", obj, 0);
    elements.forEach((e) => {
        if(e){
            e.addEventListener("click", () => {
                modifyStatus(e.id)
            })
        }
    })
}

function setListenersRec(father, obj, lvl) {
    if(isObject(obj) || isArray(obj)) {
        for(let prop in obj){
            if(String(obj[prop]).slice(0, 15) == "[object Object]") {
                //console.log(String(lvl)+"-"+String(prop))
                elements.push(document.getElementById(String(lvl)+"."+String(father)+String(prop)))
                setListenersRec(father + prop + "_", obj[prop], lvl+1);
            }
        }
        return;
    } else {
        return;
    }
}

function modifyStatus(e) {
    let lvl = e.split(".")[0]
    let param = e.split(".")[1];
    console.log(propList);
    if(propList[lvl]) {
        if(propList[lvl][param] != undefined) {
            if(propList[lvl][param] == true){
                console.log(propList[lvl][param])
                propList[lvl][param] = false
            } else {
                propList[lvl][param] = true
            }

            
            let myObj = globalObj
            let content = "<table style=\"width: 100%;cursor: default\">" + reccall("", myObj, 0) + "</table>";
            document.getElementById("root").innerHTML = content;
            setListeners(myObj);
            
        }
    }
}