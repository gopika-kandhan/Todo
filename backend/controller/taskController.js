import { addTaskService, deleteTaskService, getTaskService, updateTaskService } from "../services/taskservice.js";

const isValidStatus = (status) => status === "pending" || status === "completed";

export const addTaskController = async (req, res) => {
    const { todo, status } = req.body ?? {};
    if (typeof todo !== "string" || !todo.trim() || typeof status !== "string" || !status.trim()) {
        return res.status(400).json({ error: "Todo and status are required" });
    }
    if (!isValidStatus(status.trim())) {
        return res.status(400).json({ error: "Status must be pending or completed" });
    }

    try {
        const taskdata = {
            user: req.user.id,
            todo: todo.trim(),
            status: status.trim(),
        };
        const ret = await addTaskService(taskdata);
        return res.status(201).json({ todo: ret });
    } catch (error) {
        console.error("Failed to create task:", error);
        return res.status(500).json({ error: "Unable to create task" });
    }
};

export const getTaskController = async (req, res) => {
    try {
        const ret = await getTaskService(req.user.id);
        return res.status(200).json({ tasks: ret });
    } catch (error) {
        console.error("Failed to retrieve tasks:", error);
        return res.status(500).json({ error: "Unable to retrieve tasks" });
    }
};

export const updateTaskController = async (req, res) => {
    const { todo, status } = req.body ?? {};
    if (todo === undefined && status === undefined) {
        return res.status(400).json({ error: "At least one task field is required" });
    }
    if (todo !== undefined && (typeof todo !== "string" || !todo.trim())) {
        return res.status(400).json({ error: "Todo must be a non-empty string" });
    }
    if (status !== undefined && (typeof status !== "string" || !isValidStatus(status))) {
        return res.status(400).json({ error: "Status must be pending or completed" });
    }

    try {
        const taskdata = {
            user: req.user.id,
            ...(todo !== undefined && { todo: todo.trim() }),
            ...(status !== undefined && { status: status.trim() }),
        };
        const ret = await updateTaskService(req.params.id, taskdata);
        if (!ret) {
            return res.status(404).json({ error: "Task not found" });
        }
        return res.status(200).json({ todo: ret });
    } catch (error) {
        if (error.message === "Invalid task ID") {
            return res.status(400).json({ error: error.message });
        }
        console.error("Failed to update task:", error);
        return res.status(500).json({ error: "Unable to update task" });
    }
};

export const deleteTaskController = async (req, res) => {
    try {
        const ret = await deleteTaskService(req.params.id, req.user.id);
        if (!ret) {
            return res.status(404).json({ error: "Task not found" });
        }
        return res.status(200).json(ret);
    } catch (error) {
        if (error.message === "Invalid task ID") {
            return res.status(400).json({ error: error.message });
        }
        console.error("Failed to delete task:", error);
        return res.status(500).json({ error: "Unable to delete task" });
    }
};