import dbConnect from "../../lib/mongoose";
import Booking from "../../models/Booking";
import User from "../../models/User";
import axios from "axios";

// Time helpers
function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function overlaps(s1, e1, s2, e2) {
  return (
    Math.max(toMinutes(s1), toMinutes(s2)) <
    Math.min(toMinutes(e1), toMinutes(e2))
  );
}

// Google Calendar link
function generateGoogleCalendarLink(b) {
  const startUTC =
    b.date.replace(/-/g, "") + "T" + b.start.replace(/:/g, "") + "00Z";
  const endUTC =
    b.date.replace(/-/g, "") + "T" + b.end.replace(/:/g, "") + "00Z";

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    b.purpose || "Meeting"
  )}&dates=${startUTC}/${endUTC}&details=${encodeURIComponent(
    "Meeting with " + b.participants.map((p) => p.fullName).join(", ")
  )}&ctz=UTC`;
}

// AI call
async function parseAI(command) {
  const res = await axios.post("http://localhost:3000/api/ai/parseCommand", {
    command,
  });
  return res.data.parsed;
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { organizerEmail, command } = req.body;
  if (!organizerEmail || !command) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 1️⃣ Parse the natural language command
  let parsed;
  try {
    parsed = await parseAI(command);
  } catch {
    return res.status(500).json({ error: "AI failed to parse command" });
  }

  // 2️⃣ Deduplicate dates (prevents double insert)
  const dates = [...new Set(parsed.dates)];

  // 3️⃣ Match participants to registered users
  const allUsers = await User.find();
  const matched = parsed.participants
    .map((name) =>
      allUsers.find(
        (u) =>
          u.fullName.toLowerCase() === name.toLowerCase() ||
          u.fullName.toLowerCase().includes(name.toLowerCase())
      )
    )
    .filter(Boolean);

  if (matched.length !== parsed.participants.length) {
    return res.json({
      success: false,
      error: "Some participants not registered",
    });
  }

  const participantPayload = matched.map((u) => ({
    fullName: u.fullName,
    email: u.email,
  }));

  const createdBookings = [];

  // 4️⃣ Loop dates (safe, deduped)
  for (const date of dates) {
    // --- 4A: Check if this exact booking already exists (IDEMPOTENCY) ---
    const existing = await Booking.findOne({
      organizerEmail,
      date,
      start: parsed.start,
      end: parsed.end,
      "participants.email": { $all: matched.map((u) => u.email) },
    });

    if (existing) {
      // Prevents duplicates 100%
      createdBookings.push({
        booking: existing,
        googleCalendarLink: generateGoogleCalendarLink(existing),
        duplicated: true,
      });
      continue;
    }

    // --- 4B: Conflict check for each participant ---
    const participantEmails = matched.map((u) => u.email);
    const conflicts = await Booking.find({
      "participants.email": { $in: participantEmails },
      date,
    });

    const hasConflict = conflicts.some((b) =>
      overlaps(parsed.start, parsed.end, b.start, b.end)
    );
    if (hasConflict) continue;

    // --- 4C: Create NEW booking ---
    const booking = await Booking.create({
      organizerEmail,
      participants: participantPayload,
      date,
      start: parsed.start,
      end: parsed.end,
      purpose: parsed.purpose,
    });

    createdBookings.push({
      booking,
      googleCalendarLink: generateGoogleCalendarLink(booking),
      duplicated: false,
    });
  }

  return res.json({ success: true, createdBookings });
}
