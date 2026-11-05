
import mon from "mongoose";
import { appConfig } from "../config/config.js";

export const connectToMongoDb = async () => {
    await mon.connect(appConfig.mongo_url);
    console.log("MongoDB connected successfully");
};