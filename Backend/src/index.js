// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
 import {app} from './app.js'
 import { startPingCron } from "./cron/pingServer.js";
dotenv.config({
    path: './.env'
})




connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(` Server is running at port : ${process.env.PORT}`);
    })
    startPingCron();
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})




// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(` Server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO db connection failed !!! ", err);
// })
