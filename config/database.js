const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/userauth',{ useNewUrlParser: true })
.then(()=>{
    console.log('connected to db')
})
.catch(()=>{
    console.log('error connecting to db')
})
module.exports={mongoose}