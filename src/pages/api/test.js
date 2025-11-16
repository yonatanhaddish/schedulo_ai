// pages/api/test.js

import dbConnect from "../../lib/mongoose";
import User from "../../models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const users = await User.find({});
    return res.status(200).json({ success: true, users });
  }

  if (req.method === "POST") {
    const { fullName, email } = req.body;

    try {
      const user = await User.create({ fullName, email });
      return res.status(201).json({ success: true, user });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  res.status(405).json({ success: false, message: "Method not allowed" });
}
