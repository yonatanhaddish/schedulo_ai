import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";

import { useRouter } from "next/router";
import SmartToyIcon from "@mui/icons-material/SmartToy";

function Navbar() {
  const router = useRouter();

  const handleLoginClicked = () => {
    router.push("/login");
  };

  const handleSignupClicked = () => {
    router.push("signup");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#f5f5f5", height: "8%" }}>
      <Toolbar sx={{}}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="logo"
          sx={{ color: "#ad62d5" }}
        >
          <SmartToyIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: "#ad62d5" }}
        >
          Schedulo AI
        </Typography>
        <Box
          sx={{
            // border: "solid red 1px",
            width: "30%",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <Button
            sx={{ width: "35%", border: "solid #ad62d5 2px", color: "#4e4e4d" }}
            onClick={handleLoginClicked}
          >
            Login
          </Button>
          <Button
            sx={{
              width: "35%",
              //   border: "solid #4e4e4d 1px",
              backgroundColor: "#ad62d5",
              color: "#f5f5f5",
            }}
            onClick={handleSignupClicked}
          >
            Signup
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
