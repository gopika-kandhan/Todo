import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { appConfig } from "../config/config.js";
import { findUserByName, registerUser } from "../dal/dal.js";

export const registerService = async (username, password) => {
    if (typeof username !== "string" || !username.trim() || typeof password !== "string" || !password) {
        throw new Error("Username and password are required");
    }

    username = username.trim();
    let user = await findUserByName(username);
    if (user) {
        const error = new Error("User already exists");
        error.status = 409;
        throw error;
    }
    user = await registerUser({username, password});
    return user;
}

export const loginService = async (username, password) => {
    if (typeof username !== "string" || !username.trim() || typeof password !== "string" || !password) {
        const error = new Error("Username and password are required");
        error.status = 400;
        throw error;
    }

    let user = await findUserByName(username.trim());
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }

    const token = jwt.sign({id:user._id}, appConfig.jwt_key, {expiresIn: '1h'});
    return {user, token};
}