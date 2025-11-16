import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite error in Next.js hot reload
export default mongoose.models.User || mongoose.model("User", UserSchema);
