import mongoose from "mongoose";

const userActivitySchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  type: { type: String, enum: ["admin", "customer"], required: true },
  lastLogin: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: false },
});

const UserActivity = mongoose.model("UserActivity", userActivitySchema);
export default UserActivity;
