import mongoose, { model, Schema } from "mongoose";

const taskSchema = new Schema({
    todo: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "completed"], required: true, default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const Taskmodel = model("task", taskSchema);