import express from "express";
import { appConfig } from "./config/config.js";
import { connectToMongoDb } from "./db/mongoDB.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes); 

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

export default app;

const startServer = async () => {
    if (appConfig.db !== "mongo") {
        throw new Error('DB must be set to "mongo" in the environment');
    }
    if (!appConfig.mongo_url) {
        throw new Error("MONGO_URL must be set in the environment");
    }
    if (!appConfig.jwt_key) {
        throw new Error("JWT_SECRET must be set in the environment");
    }

    await connectToMongoDb();
    const server = app.listen(appConfig.port, appConfig.host, () => {
        console.log(`Server listening on http://${appConfig.host}:${appConfig.port}`);
    });

    server.on("error", (error) => {
        console.error(`Failed to listen on port ${appConfig.port}:`, error.message);
        process.exit(1);
    });
};

startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
});