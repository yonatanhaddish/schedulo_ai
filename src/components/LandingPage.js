import React from "react";
import { Typography, Button, Box } from "@mui/material";

function LandingPage() {
  return (
    <Box sx={{ height: "92%", display: "flex" }}>
      <Box
        sx={{
          //   border: "solid blue 2px",
          width: "60%",
          backgroundColor: "#C6C6C6",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            // border: "solid green 2px",
            height: "60%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Box
            sx={{
              //   border: "solid green 2px",
              width: "90%",
              textAlign: "center",
              justifySelf: "center",
            }}
          >
            <Typography sx={{ fontSize: "50px" }}>
              <span style={{ color: "#ad62d5" }}>Schedulo</span> - Your AI
              Powered Meeting Scheduler
            </Typography>
          </Box>
          <Box
            sx={{
              //   border: "solid green 2px",
              width: "70%",
              textAlign: "center",
              justifySelf: "center",
            }}
          >
            <Typography sx={{ fontSize: "20px", fontWeight: "italic" }}>
              Say goodbye to scheduling chaos. Just describe your meeting in
              plain English — Schedulo handles the rest.
            </Typography>
          </Box>
          <Box
            sx={{
              // border: "solid green 2px",
              width: "70%",
              justifySelf: "center",
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <Button
              sx={{
                border: "solid #ad62d5 2px",
                color: "#4e4e4d",
                width: "30%",
              }}
            >
              Login
            </Button>
            <Button
              sx={{
                backgroundColor: "#ad62d5",
                color: "#f5f5f5",
                width: "30%",
              }}
            >
              Get Started
            </Button>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          //   border: "solid red 2px",
          width: "40%",
          backgroundColor: "#4e4e4d",
          backgroundImage: "url('/images/landing_page.jpeg')",
        }}
      ></Box>
    </Box>
  );
}

export default LandingPage;
