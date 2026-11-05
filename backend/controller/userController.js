import { loginService, registerService } from "../services/userservice.js";

export const regUserController = async (req, res) => {
    try {
        await registerService(req.body?.username, req.body?.password);
        return res.status(201).json({ msg: "User created successfully" });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ error: "User already exists" });
        }
        console.error("Failed to register user:", error);
        return res.status(500).json({ error: "Unable to register user" });
    }
};

export const loginController = async (req, res) => {
    try {
        const retVal = await loginService(req.body?.username, req.body?.password);
        return res.status(200).json({ msg: "User login successful", token: retVal.token });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error("Failed to log in:", error);
        return res.status(500).json({ error: "Unable to log in" });
    }
};