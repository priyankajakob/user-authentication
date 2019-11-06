const mongoose = require('mongoose')
const validator=require('validator')
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Schema = mongoose.Schema

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:5
    },
    email:{
        type:String,
        required:true,
        unique:true,
        //to check format of email - custom validations - validator package
        validate : {
            validator:(value)=>{
                return validator.isEmail(value)
            },
            message : ()=>{
                return 'Invalid Email format'
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        maxlength:128
    },
    tokens : [
        {
            token:{
                type:String
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ]

    
})

//mongoose middleware - prehooks
userSchema.pre('save',function (next){
    const user = this
    //pre-save will get called for both create/update of user but as we need to encrypt password only during create we use isNew property to check if the user is new, only then encrypt password else call the next function directly.
    if(user.isNew){
        bcryptjs.genSalt(10)
        .then(function (salt){
            bcryptjs.hash(user.password,salt)
            .then(function (encryptedPassword){
                user.password=encryptedPassword
                next()
            })
        })
    }
    else {
        next()
    }
})

//defining own static method
userSchema.statics.findByCredentials=function(email,password){
    const user = this
    return User.findOne({email})
                .then(user=>{
                        if(user){
                            return bcryptjs.compare(password,user.password)
                                    .then(result=>{
                                            if(result){
                                                return Promise.resolve(user)
                                            }
                                            else {
                                                return Promise.reject('Invalid Email/Password')
                                            }
                                        })
                        }
                        else {
                            return Promise.reject('Invalid Email/Password')
                        }
                })
                .catch(err=>{
                        return Promise.reject(err)
                })
}

//instance method
userSchema.methods.generateToken=function(){
    const user=this
    const tokenData={
        _id:user._id,
        username:user.username,
        createdAt:Number(new Date())
    }
    const token = jwt.sign(tokenData,'jwt@123')
    user.tokens.push({
        token
    })
    console.log(token)
    return user.save()
    .then(user=>{
        return Promise.resolve(token)
    })
    .catch(err=>{
        return Promise.reject(err)
    })
}

userSchema.statics.findByToken=function(token){
    const User=this
    let tokenData
    try {
        tokenData = jwt.verify(token,'jwt@123')
    }
    catch(err){
        return Promise.reject(err)
    }
    return User.findOne({
        _id:tokenData._id,
        'tokens.token': token
    })
}
const User = mongoose.model('User',userSchema)
module.exports = {User}