import React, { useState } from "react";
import { useRouter } from "next/router";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoHomePage = () => router.push("/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/");
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", backgroundColor: "#c6c6c6" }}>
      {/* Go Back Button */}
      <Box
        sx={{
          height: "8%",
          display: "flex",
          width: "200px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button onClick={handleGoHomePage} sx={{ color: "black" }}>
          <ArrowBackIcon sx={{ fontSize: "30px" }} />
          <Typography>Go Back</Typography>
        </Button>
      </Box>

      {/* Main Layout */}
      <Box sx={{ height: "92%", display: "flex" }}>
        {/* Left Image Section */}
        <Box
          sx={{
            width: "50%",
            height: "90%",
            backgroundImage: "url('/images/landing_page.jpeg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            alignSelf: "center",
          }}
        />

        {/* Login Form */}
        <Box
          sx={{
            maxWidth: "400px",
            mx: "auto",
            mt: 8,
            p: 4,
            borderRadius: 2,
            boxShadow: 2,
            height: "92%",
            display: "flex",
            flexDirection: "column",
            maxHeight: "600px",
            gap: "60px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
            Login to Your Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{
                shrink: true,
                style: { color: "#ad62d5" },
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    border: "2px solid #ad62d5",
                  },
                  "&.Mui-focused fieldset": {
                    border: "2px solid #ad62d5",
                  },
                },
              }}
            />

            {/* Password */}
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{
                shrink: true,
                style: { color: "#ad62d5" },
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    border: "2px solid #ad62d5",
                  },
                  "&.Mui-focused fieldset": {
                    border: "2px solid #ad62d5",
                  },
                },
              }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: "#ad62d5" }}
              fullWidth
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Don’t have an account?{" "}
            <Button onClick={() => router.push("/signup")}>Sign Up</Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
