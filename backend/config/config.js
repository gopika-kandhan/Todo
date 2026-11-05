import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(backendDirectory, "..", ".env") });

export const appConfig = {
    port: Number(process.env.PORT || 5000),
    host: process.env.HOST || "0.0.0.0",
    jwt_key: process.env.JWT_SECRET,
    mongo_url: process.env.MONGO_URL,
    db: (process.env.DB || "").trim().toLowerCase().replace(/^["']|["']$/g, ""),
};