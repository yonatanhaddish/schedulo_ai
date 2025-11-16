import dbConnect from "../../lib/mongoose";
import User from "../../models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { fullName, email } = req.body;
    if (!fullName || !email)
      return res.status(400).json({ error: "fullName and email required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    const user = await User.create({ fullName, email });
    return res.json({ success: true, user });
  }

  if (req.method === "GET") {
    const users = await User.find();
    return res.json({ success: true, users });
  }

  res.status(405).json({ error: "Method not allowed" });
}
