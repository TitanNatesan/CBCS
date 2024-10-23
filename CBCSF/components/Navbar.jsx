"use client";
import React from "react";
import Image from "next/image";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ffffff",
    },
  },
});

const Navbar = () => {
  const logout = () =>{
    localStorage.clear();
    window.location.href = "/";
  }
  return (
    <>
      <ThemeProvider theme={theme}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="100%"
            >
              <Image
                src="https://admission.kahedu.edu.in/assets/img/logo-ftr.png"
                width={300} // Increased width for a larger logo
                height={80} // Adjusted height for better proportions
                alt="KAHE logo"
                style={{ marginBottom: "10px" }} // Margin for centering purposes
              />
            </Box>
            {/* <Box display="flex" alignItems="center" marginLeft="auto">
            <Typography variant="h6" component="div" color="textPrimary">
              Faculty of Engineering
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" marginLeft={1}>
              Course Registration
            </Typography>
          </Box> */}
            <Image
              src="https://metaverse-portal.vercel.app/static/media/metaverselogo.aab67fbf864e9682cbe5.jpg"
              width={50}
              height={50}
              alt="Metaverse logo"
              style={{ borderRadius: "50%", marginLeft: "16px" }}
            />
            <span class="material-symbols-outlined" onClick={logout}>
              logout
            </span>
          </Toolbar>
        </AppBar>
      </ThemeProvider>
    </>
  );
};

export default Navbar;
