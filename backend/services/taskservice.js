import mongoose from "mongoose";
import { Taskmodel } from "../model/taskmodel.js";

export const addTaskService = (taskdata) => {
    return Taskmodel.create(taskdata);
};

export const getTaskService = (userid) => {
    return Taskmodel.find({ user: userid }).sort({ createdAt: 1 });
};

export const updateTaskService = (taskid, taskdata) => {
    if (!mongoose.isValidObjectId(taskid)) {
        throw new Error("Invalid task ID");
    }

    const updates = {};
    if (taskdata.todo !== undefined) updates.todo = taskdata.todo;
    if (taskdata.status !== undefined) updates.status = taskdata.status;

    return Taskmodel.findOneAndUpdate(
        { _id: taskid, user: taskdata.user },
        { $set: updates },
        { returnDocument: "after", runValidators: true }
    );
};

export const deleteTaskService = (taskid, userid) => {
    if (!mongoose.isValidObjectId(taskid)) {
        throw new Error("Invalid task ID");
    }

    return Taskmodel.findOneAndDelete({ _id: taskid, user: userid });
};