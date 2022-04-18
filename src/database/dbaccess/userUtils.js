let userModule = require("../models/userModel")

function getUsers(){
    return new Promise((res, rej) => {
        userModule.User.find().then((list) => {
            res(list);
        }).catch((err) => {
            rej(err);
        })
    })
}

function findUserByName(nick) {
    return new Promise((res, rej) => {
        userModule.User.find({username: nick}).then((list) => {
            if(list.length == 0) {
                rej("No user found");
            } else {
                res(list[0]);
            }
        }).catch((err) => {
            rej(err);
        })
    })
}

function returnCleanUser(nick) {
    let aux = {
        "username": "",
        "email": "", 
        "fullname": "",
        "registration": 0,
        "additionalInfo": {}
    }
    return new Promise((res, rej) => {
        userModule.User.find({username: nick}).then((list) => {
            if(list.length == 0) {
                rej("No user found");
            } else {
                for(let prop in aux) {
                    aux[prop] = list[0][prop]
                }
                res(aux);
            }
        }).catch((err) => {
            rej(err);
        })
    })
}

function validateUser(user, passwd){
    return new Promise((res, rej) => {
        userModule.User.find({username: user}).then((list) => {
            if(list.length == 0) {
                rej("No user found");
            }
            list[0].comparePassword(passwd, (err, isMatch) => {
                if(err) throw err;
                res(isMatch)
            });
        }).catch((err) => {
            rej(err);
        })
    })
}

function checkIfValidReg(queryUser, queryEmail) {
    return new Promise((res, rej) => {
        let user
        let email
        try {
            userModule.User.find({username: queryUser}).then((userval) => {
                user = userval;
                userModule.User.find({email: queryEmail}).then((emailval) => {
                    email = emailval;
                    if(user.length > 0){
                        res({
                            type: "res",
                            register: false,
                            validUser: "Ese usuario ya se encuentra registrado"
                        });
                    }
                    if(email.length > 0){
                        res({
                            type: "res",
                            register: false,
                            validEmail: "Ese correo ya se encuentra registrado"
                        });
                    }
                    res({
                        val: true,
                        msg: ""
                    });
                })

            });
        } catch(err) {
            rej(err)
        }
    })
}

function postNewUser(userInfo) {
    let newUser = new userModule.User(userInfo);
    return new Promise((res, rej) => {
        newUser.save().then(() => {
            res("User created");
        }).catch((err) => {
            rej(err);
        })
    })
}

function deleteOneUser(nick) {
    return new Promise((res, rej) => {
        if(!nick) {
            rej("Query field required - 'username'")
        }
        userModule.User.deleteOne({username: nick}).then((deletions) => {
            if(deletions.deletedCount == 0) {
                rej(`User ${nick} does not exist`)
            } else {
                res("User succesfully deleted");
            }
            
        }).catch((err) => {
            rej(err);
        })
    })
}

exports.getUsers = getUsers
exports.findUserByName = findUserByName
exports.checkIfValidReg = checkIfValidReg
exports.postNewUser = postNewUser
exports.deleteOneUser = deleteOneUser
exports.validateUser = validateUser
exports.returnCleanUser = returnCleanUser