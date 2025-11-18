import dbConnect from "../../lib/mongoose";
import Booking from "../../models/Booking";
import User from "../../models/User";
import axios from "axios";
import { verifyToken } from "../../lib/jwt";
import cookie from "cookie";

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

// Google Calendar link generator
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

// Normalize for case-insensitive matching
function normalize(str) {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

// --- Get logged-in user from JWT cookie ---
function getUserFromRequest(req) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) return null;
  return verifyToken(token);
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // --- 1️⃣ Get logged-in user from JWT ---
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  const organizerEmail = user.email;

  // --- 2️⃣ Validate input ---
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: "Command required" });

  // --- 3️⃣ Parse AI command ---
  let parsed;
  try {
    parsed = await parseAI(command);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "AI failed to parse command", details: err.message });
  }

  // Deduplicate dates
  const dates = [...new Set(parsed.dates)];

  // --- 4️⃣ Match participants ---
  const allUsers = await User.find();
  const matched = parsed.participants
    .map((pName) => {
      // exact match first
      let match = allUsers.find(
        (u) => normalize(u.fullName) === normalize(pName)
      );
      if (!match) {
        // fallback to includes
        match = allUsers.find((u) =>
          normalize(u.fullName).includes(normalize(pName))
        );
      }
      return match;
    })
    .filter(Boolean);

  if (matched.length !== parsed.participants.length) {
    return res
      .status(400)
      .json({ success: false, error: "Some participants not registered" });
  }

  const participantPayload = matched.map((u) => ({
    fullName: u.fullName,
    email: u.email,
  }));

  const createdBookings = [];

  // --- 5️⃣ Loop dates ---
  for (const date of dates) {
    // Idempotency check
    const existing = await Booking.findOne({
      organizerEmail,
      date,
      start: parsed.start,
      end: parsed.end,
      "participants.email": { $all: matched.map((u) => u.email) },
    });

    if (existing) {
      createdBookings.push({
        booking: existing,
        googleCalendarLink: generateGoogleCalendarLink(existing),
        duplicated: true,
      });
      continue;
    }

    // Conflict check
    const conflicts = await Booking.find({
      date,
      $or: [
        { organizerEmail }, // conflicts where organizer is busy
        { "participants.email": { $in: matched.map((u) => u.email) } }, // conflicts for participants
      ],
    });

    const conflictingBookings = conflicts.filter((b) =>
      overlaps(parsed.start, parsed.end, b.start, b.end)
    );

    if (conflictingBookings.length > 0) {
      // Return conflict info for this date
      createdBookings.push({
        conflict: true,
        date,
        start: parsed.start,
        end: parsed.end,
        participants: participantPayload.map((p) => p.fullName),
        conflicts: conflictingBookings.map((b) => ({
          participants: b.participants.map((p) => p.fullName),
          start: b.start,
          end: b.end,
        })),
      });
      continue;
    }

    // Create new booking
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
