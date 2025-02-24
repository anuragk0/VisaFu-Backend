const http=require('http');
const app=require('./src/app');
const database=require('./config/database');


//uncaughtException Error
process.on('uncaughtException',(err)=>{
    console.log(`Error:${err}`);
    console.log('uncaughtException Error so, shutdown the PROCESS');
    server.close(()=>{
        process.exit();
    })
})

const server=http.createServer(app);

//connecting to database
const con=database();
con.then((message)=>{
    console.log(message);
    server.listen(process.env.PORT,()=>{
        console.log(`Server is working on ${process.env.PORT}`);
    });
}).catch((message)=>{
    console.log(message);
})



// unhandledRejection Error
process.on('unhandledRejection',(err)=>{
    console.log(err);
    console.log('unhandledRejection Error so, shutdown the PROCESS');
    server.close(()=>{
        process.exit();
    })
})