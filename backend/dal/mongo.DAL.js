import { Taskmodel } from "../model/taskmodel.js";
import { Usermodel } from "../model/usermodel.js";

export const findUserByName = (username) => {
    return Usermodel.findOne({username});
}

export const registerUser = (userdata) => {
    return Usermodel.create(userdata);
}

export const addTask = (taskdata) => {
    return Taskmodel.create(taskdata);
}

export const findById = (id, userid) => {
    return Taskmodel.findOne({ _id: id, user: userid });
}

export const getTasks = (userid) => {
    return Taskmodel.find({user:userid});
}

export const updateTask = (id, taskdata) => {
    return Taskmodel.findOneAndUpdate(
        { _id: id, user: taskdata.user },
        taskdata,
        { returnDocument: "after", runValidators: true }
    );
}

export const deleteTask = (id, userid) => {
    return Taskmodel.findOneAndDelete({ _id: id, user: userid });
}