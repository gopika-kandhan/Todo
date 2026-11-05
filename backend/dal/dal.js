import * as mongoDAL from "./mongo.DAL.js";

const selectedDAL = mongoDAL;

export const {
    findUserByName,
    registerUser,
    addTask,
    getTasks,
    updateTask,
    findById,
    deleteTask,
} = selectedDAL;