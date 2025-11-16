import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  organizerEmail: { type: String, required: true },
  participants: [{ fullName: String, email: String }],
  date: { type: String, required: true }, // YYYY-MM-DD
  start: { type: String, required: true }, // HH:MM
  end: { type: String, required: true }, // HH:MM
  purpose: { type: String, default: "Meeting" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
