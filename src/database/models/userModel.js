const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { callbackPromise } = require("nodemailer/lib/shared");
const SALT_WORK_FACTOR = 10;
const UserSchema = new mongoose.Schema({
    username : {type: String, required: true, index: {unique: true}}, 
    fullname : String,
    password : {type: String, required: true},
    email : String,
    registration : Number,
    additionalInfo: {type: Object, required: false}
});

/*
UserSchema.pre('save', (next) => {
    let user = this;
    if(!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
        })
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}*/

UserSchema.pre('save', function(next) {
    if(!this.isModified('password')) { return next();}
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    return cb(null, bcrypt.compareSync(candidatePassword, this.password));
};


const User = mongoose.model("User", UserSchema);

exports.User = User
exports.UserSchema = UserSchema