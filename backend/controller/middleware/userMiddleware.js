import jwt from "jsonwebtoken"
import { appConfig } from "../../config/config.js";

export const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length).trim()
        : null;

    if (!token) {
        return res.status(401).json({ error: "Authentication token is required" });
    }

    try {
        const user = jwt.verify(token, appConfig.jwt_key);
        if (!user || typeof user !== "object" || !user.id) {
            return res.status(401).json({ error: "Invalid token" });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};