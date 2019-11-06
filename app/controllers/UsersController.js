const express = require('express')
const bcryptjs=require('bcryptjs')
const router = express.Router()
const {authenticateUser}=require('../middlewares/authentication')

const {User} = require('../models/User')

//localhost:3010/users/register
router.post('/register',(req,res)=>{
    const body = req.body
    const user = new User(body)
    user.save()//After prehooks, user gets saved and below execution continues
    .then((user)=>{
        res.send(user)
    })
    .catch((err)=>{
        res.send(err)
    })
})

//localhost:3010/users/login
router.post('/login',(req,res)=>{
    const body = req.body
    User.findByCredentials(body.email,body.password)
    .then(user=>{
        return user.generateToken()
    })
    .then(token=>{
        res.setHeader('x-auth',token).send({})
    })
    .catch(err=>{
        res.send(err)
    })

    //refractoring code to follow skinny controllers and fat models - hence commenting below codes and calling above static methods
    // User.findOne({email:body.email})
    // .then((user)=>{
    //     if(!user){
    //         res.status('404').send('Invalid Email/Password')
    //     }
    //     bcryptjs.compare(body.password,user.password)
    //     .then((result)=>{
    //         if(result){
    //             res.send("Login successfull")
    //         }
    //         else {
    //             res.status('404').send('Invalid Email/Password')
    //         }
    //     })
    // })
    // .catch((err)=>{
    //     res.send(err)
    // })
})

//localhost:3010/users/account
router.get('/account',authenticateUser,(req,res)=>{

//moved findByToken code to middlewares as it is a common functionality which is gng to be required by other routes as well
  
//Below is another approach of finding by token
//   if(token){
//    User.findOne({'tokens.token':token})
//    .then(user=>{
//        if(user)
//        res.send('Account')
//        else
//        res.status(401).send({})
//    })
//    .catch(err=>{
//        res.send(err)
//    })
//   } else{
//       res.status(401).send({})
//   }

    // res.send('success')

    //how to get back user object
    const {user}=req
    res.send(user)

})

//localhost:3010/users/logout
router.delete('/logout',authenticateUser,(req,res)=>{
    const {user,token}=req
    //We need to delete the particular token from tokens array
    User.findByIdAndUpdate(user._id,{ $pull: { tokens:{token:token}}})
    .then(user=>{
        res.send("successfully logged out")
    })
    .catch(err=>{
        res.send(err)
    })
})


module.exports = {
    usersRouter:router
}