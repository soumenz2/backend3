const config=require('./src/config')
const app=require('./src/app')


const mongoose=require('mongoose')

  const PORT =  config.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running on localhost:${PORT}`)
    mongoose.connect(config.db)

})