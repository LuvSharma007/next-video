import mongoose from "mongoose";
import { buffer } from "stream/consumers";

const mongoDbUrl = process.env.MONGODB_URL!
const mongoDbName = process.env.MONGODB_DB_NAME!

if(mongoDbUrl){
    throw new Error("MongoDb Url is missing")
}


let cached = global.mongoose

if(!cached){
    cached = global.mongoose = {conn : null,promise:null}
}

export async function connectDB(){
    if(cached.conn){
        return cached.conn;
    }

    if(!cached.promise){

        const opts = {
            bufferCommands:true,
            maxPoolSize:10
        }

        mongoose.connect(`${mongoDbUrl}/${mongoDbName}`,opts)
        .then(()=>mongoose.connection)
    }

    try {
        cached.conn = await cached.promise
        console.log('DB is connected');
    } catch (error) {
        cached.promise = null;
        console.log('DB is not connected',error);
        throw error;
    }
}