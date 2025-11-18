import React from "react";
import { Typography, Button, Box } from "@mui/material";

function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: "#342B39",
        height: "5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="body2" color="white">
        © 2026 — Website App built by Yonatan H.
      </Typography>
    </Box>
  );
}

export default Footer;
