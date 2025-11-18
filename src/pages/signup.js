import React, { useState } from "react";
import { useRouter } from "next/router";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoHomePage = () => {
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // Redirect to dashboard or landing page after signup
      router.push("/chatbot");
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", backgroundColor: "#c6c6c6" }}>
      <Box
        sx={{
          height: "8%",
          display: "flex",
          //   border: "solid green 2px",
          width: "200px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button onClick={handleGoHomePage} sx={{ color: "black" }}>
          <ArrowBackIcon sx={{ fontSize: "30px" }} />
          <Typography sx={{}}>Go Back</Typography>
        </Button>
      </Box>
      <Box sx={{ height: "92%", display: "flex" }}>
        <Box
          sx={{
            // border: "solid blue 2px",
            width: "50%",
            height: "90%",
            backgroundImage: "url('/images/landing_page.jpeg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            alignSelf: "center",
          }}
        >
          {" "}
        </Box>
        <Box
          sx={{
            maxWidth: "400px",
            mx: "auto",
            mt: 8,
            p: 4,
            border: "1px solid #ff",
            borderRadius: 2,
            boxShadow: 2,
            height: "92%",
            display: "flex",
            flexDirection: "column",
            maxHeight: "600px",
            gap: "40px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
            Create an Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              InputLabelProps={{
                shrink: true, // keep label on top
                style: { color: "#ad62d5" }, // label color
              }}
              sx={{
                mb: 2,

                "& .MuiOutlinedInput-root": {
                  //   border: "2px solid #ad62d5",
                  "&:hover fieldset": {
                    border: "2px solid #ad62d5",
                  },
                  "&.Mui-focused fieldset": {
                    border: "2px solid #ad62d5", // keep same border on focus
                  },
                },
              }}
            />

            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{
                shrink: true, // keep label on top
                style: { color: "#ad62d5" }, // label color
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  //   border: "2px solid #ad62d5",
                  "&:hover fieldset": {
                    border: "2px solid #ad62d5",
                  },
                  "&.Mui-focused fieldset": {
                    border: "2px solid #ad62d5", // keep same border on focus
                  },
                },
              }}
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{
                shrink: true, // keep label on top
                style: { color: "#ad62d5" }, // label color
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  //   border: "2px solid #ad62d5",
                  "&:hover fieldset": {
                    border: "2px solid #ad62d5",
                  },
                  "&.Mui-focused fieldset": {
                    border: "2px solid #ad62d5", // keep same border on focus
                  },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: "#ad62d5" }}
              fullWidth
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Already have an account?{" "}
            <Button onClick={() => router.push("/login")}>Login</Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default SignupPage;
