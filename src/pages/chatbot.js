import { useState, useEffect } from "react";
import axios from "axios";

import { useRouter } from "next/router";

import {
  Typography,
  Button,
  Box,
  IconButton,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
} from "@mui/material";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";

export default function Chatbot() {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [errorAlertSwitch, setErrorAlertSwitch] = useState(false);

  const router = useRouter();

  // Fetch all users
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await axios.get("/api/user");
        setUsers(res.data.users);
      } catch (err) {
        console.error("Users fetch failed:", err);
      }
    }
    loadUsers();
  }, []);

  useEffect(() => {
    const booking = response?.createdBookings?.[0];
    if (booking && booking.duplicated === false) {
      setErrorAlertSwitch(true);
      setAlertMessage("BOOKING MEETING WAS SUCCESSFUL");
      setAlertOpen(true);
      setTimeout(() => {
        setAlertMessage("");
        setAlertOpen(false);
      }, 2000);
    } else if (booking && booking.duplicated === true) {
      setAlertMessage("CONFLICT FOUND IN YOUR BOOKING");
      setErrorAlertSwitch(false);
      setAlertOpen(true);
      setTimeout(() => {
        setAlertMessage("");
        setAlertOpen(false);
      }, 2000);
    }
  }, [response]);

  async function handleLogout() {
    await axios.post("/api/auth/logout");
    router.push("/"); // redirect
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post("/api/booking", { command });
      setResponse(res.data);
    } catch (err) {
      setResponse({
        error: err.response?.data?.error || "Something went wrong",
      });
      setErrorAlertSwitch(false);
      setAlertMessage("Empty Prompt Command");
      setAlertOpen(true);
      setTimeout(() => {
        setAlertMessage("");
        setAlertOpen(false);
      }, 2000);
    }

    setLoading(false);
  }

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );
  console.log("44", response?.success);
  return (
    <Box sx={{ height: "100vh" }}>
      {/* TOP NAV */}
      {alertOpen && (
        <Alert
          icon={
            errorAlertSwitch ? (
              <CheckIcon
                fontSize="inherit"
                severity="success"
                sx={{ color: "#f5f5f5" }}
              />
            ) : (
              <ErrorIcon fontSize="inherit" sx={{ color: "#f5f5f5" }} />
            )
          }
          severity="success"
          sx={{
            position: "fixed",
            top: 5,
            left: 0,
            right: 0,
            zIndex: 1301,
            width: "400px",
            margin: "0 auto",
            height: "80px",
            justifySelf: "center",
            color: "#f5f5f5",
            backgroundColor: "#ad62d5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
          }}
        >
          {alertMessage}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          height: "8%",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "150px",
            alignItems: "center",
            marginLeft: "20px",
          }}
        >
          <IconButton edge="start" sx={{ color: "#ad62d5" }}>
            <SmartToyIcon />
          </IconButton>

          <Typography variant="h6" sx={{ color: "#ad62d5" }}>
            Schedulo AI
          </Typography>
        </Box>

        <Box
          sx={{
            width: "160px",
            textAlign: "center",
            alignSelf: "center",
          }}
        >
          <Button
            sx={{
              width: "60%",
              backgroundColor: "#ad62d5",
              color: "#f5f5f5",
              ":hover": { backgroundColor: "#964ec0" },
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* MAIN SECTION */}
      <Box
        sx={{
          backgroundColor: "#C6C6C6",
          height: "92%",
          display: "flex",
        }}
      >
        {/* LEFT PANEL — USERS LIST */}
        <Box
          sx={{
            width: "25%",
            borderRight: "1px solid #999",
            padding: 2,
            backgroundColor: "#E3E3E3",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Team Members
          </Typography>

          {/* USER SEARCH */}
          <TextField
            placeholder="Search users..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* USER LIST */}
          <List sx={{ maxHeight: "80vh", overflowY: "auto" }}>
            {filteredUsers.map((user) => (
              <ListItem
                key={user._id}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText primary={user.fullName} secondary={user.email} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* RIGHT PANEL — CHAT + RESPONSE */}
        <Box sx={{ width: "75%", padding: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            AI Booking Assistant
          </Typography>

          {/* CHAT INPUT */}
          <form onSubmit={handleSubmit}>
            <TextField
              multiline
              minRows={4}
              placeholder="Type your booking command..."
              fullWidth
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              sx={{
                mb: 2,
                backgroundColor: "white",
                borderRadius: 2,
              }}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#ad62d5",
                ":hover": { backgroundColor: "#964ec0" },
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send"
              )}
            </Button>
          </form>

          {/* RESPONSE DISPLAY */}
          <Box sx={{ mt: 3 }}>
            {response?.error && (
              <Typography color="red">{response.error}</Typography>
            )}
            {response?.success &&
              response?.createdBookings?.map((b, idx) => (
                <Box
                  key={idx}
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "white",
                    borderRadius: 2,
                    border: "1px solid #ccc",
                  }}
                >
                  {b.conflict ? (
                    <>
                      <Typography
                        color="red"
                        fontStyle={"italic"}
                        fontSize="14px"
                      >
                        ⚠ Conflict for {b.participants.join(", ")} on {b.date}{" "}
                        from {b.start} - {b.end}
                      </Typography>
                      {b.conflicts.map((c, i) => (
                        <Typography key={i} sx={{ ml: 2 }}>
                          Conflicts with {c.participants.join(", ")} from{" "}
                          {c.start} - {c.end}
                        </Typography>
                      ))}
                    </>
                  ) : (
                    <>
                      <Typography>
                        <strong>Date:</strong> {b.booking.date}
                      </Typography>
                      <Typography>
                        <strong>Time:</strong> {b.booking.start} -{" "}
                        {b.booking.end}
                      </Typography>
                      <Typography>
                        <strong>Participants:</strong>{" "}
                        {b.booking.participants
                          .map((p) => p.fullName)
                          .join(", ")}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>
                        <a
                          href={b.googleCalendarLink}
                          target="_blank"
                          style={{ color: "#ad62d5" }}
                        >
                          Add to Google Calendar
                        </a>
                      </Typography>
                      {b.duplicated && (
                        <Typography color="orange">
                          ⚠ Booking already exists
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
