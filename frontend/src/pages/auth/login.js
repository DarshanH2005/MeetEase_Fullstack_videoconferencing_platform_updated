import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import { Container, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import AppTheme from "../../utils/shared-theme/appTheme";
import EnhancedAppBar from "../../components/ui/EnhancedAppBar";
import Footer from "../../utils/mainpage/components/Footer";
import LoginHero from "../../components/auth/LoginHero";
import ToastNotification from "../../components/common/ToastNotification";
import BlurryBlob from "../../components/ui/BlurryBlob";

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(3),
  paddingTop: theme.spacing(12), // Add space for navbar
  [theme.breakpoints.down("sm")]: {
    paddingTop: theme.spacing(10),
  },
}));

const AnimatedBox = styled(motion.div)({
  width: "100%",
  maxWidth: "500px", // Increased from 450px
});

export default function LoginPage(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={(theme) => ({
          minHeight: "100vh",
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        })}
      >
        <BlurryBlob
          firstBlobColor="#667eea"
          secondBlobColor="#764ba2"
          thirdBlobColor="#60a5fa"
          intensity="light"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />
        <EnhancedAppBar />
        <PageContainer sx={{ position: "relative", zIndex: 1 }}>
          <AnimatedBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)"
                  : "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
              backdropFilter: "blur(10px)",
              border: (theme) =>
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(102, 126, 234, 0.1)",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                  : "0 8px 32px rgba(102, 126, 234, 0.1)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, #fff 0%, #a0aec0 100%)"
                      : "linear-gradient(135deg, #1a202c 0%, #4a5568 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: "1.1rem" }}
              >
                Sign in to continue to MeetEase
              </Typography>
            </Box>

            <LoginHero />
          </AnimatedBox>
        </PageContainer>
        <Divider />
        <Footer />
      </Box>
      <ToastNotification />
    </AppTheme>
  );
}
