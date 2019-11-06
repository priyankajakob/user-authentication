const {User}=require('../models/User')

const authenticateUser=function(req,res,next){
    const token=req.header('x-auth')
      User.findByToken(token)
      .then(user=>{
          //sending resposne from middleware is not feasible as responses can be different for different routes therefore call next
          
          //to send back user object
          if(user){
            req.user=user
            req.token=token
            next()
          }
          else{
              res.status(401).send({notice:"token not available"})
          }
          

      })
      .catch(err=>{
          console.log("err",err)
          res.status(401).send(err)
      })
}
module.exports={
    authenticateUser
}