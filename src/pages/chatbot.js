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
  Fade,
} from "@mui/material";

import emailjs from "@emailjs/browser";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import Footer from "@/components/Footer";

export default function Chatbot() {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [errorAlertSwitch, setErrorAlertSwitch] = useState(false);

  const [resultSent, setResultSent] = useState("");

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
      sendEmailToAllParticipants(booking);
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

  function sendEmailToAllParticipants(booking) {
    const { date, start, end, participants, organizerEmail, purpose } =
      booking.booking;

    // All participants in BCC (comma-separated)
    const bccList = participants.map((p) => p.email).join(",");

    const templateParams = {
      meeting_date: date,
      meeting_start: start,
      meeting_end: end,
      participants: participants.map((p) => p.fullName).join(", "),
      organizer_email: organizerEmail,
      meeting_purpose: purpose || "No purpose provided",

      // EmailJS email target fields
      to_email: organizerEmail,
      bcc_list: bccList, // <<< use a safe variable name
    };

    emailjs.send(
      process.env.NEXT_PUBLIC_SERVICE_ID,
      process.env.NEXT_PUBLIC_TEMPLATE_ID,
      templateParams,
      process.env.NEXT_PUBLIC_PUBLIC_KEY
    );

    console.log("BCC list sent:", bccList);
  }

  console.log("5555555", resultSent);

  useEffect(() => {
    // setMounted(true);
    const timer = setTimeout(() => setLoadingPage(false), 500);

    return () => clearTimeout(timer);
  }, []);

  if (loadingPage) {
    return (
      <Box
        sx={{
          backgroundColor: "#d9d9d9",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <SmartToyIcon sx={{ height: 100, width: 100, color: "#ad62d5" }} />
        <CircularProgress
          sx={{ width: 100, height: 100, mt: 2, color: "#ad62d5" }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh" }}>
      {/* TOP NAV */}
      {alertOpen && (
        <Fade in={alertOpen} timeout={500}>
          <Alert
            icon={
              errorAlertSwitch ? (
                <CheckIcon fontSize="inherit" sx={{ color: "#c6c6c6" }} />
              ) : (
                <ErrorIcon fontSize="inherit" sx={{ color: "#c6c6c6" }} />
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
        </Fade>
      )}
      <Box
        sx={{
          display: "flex",
          height: "8%",
          justifyContent: "space-between",
          // border: "solid blue 2px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "150px",
            alignItems: "center",
            marginLeft: "20px",
            // border: "solid blue 2px",
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
            width: "450px",
            textAlign: "center",
            alignSelf: "center",
            // border: "solid blue 2px",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Typography sx={{ borderBottom: "solid #964ec0 1px" }}>
            {/* Homer Simpson{" "} */}
          </Typography>
          <Button
            sx={{
              width: "120px",
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
          height: "87%",
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
      </Box>{" "}
      <Footer />
    </Box>
  );
}
