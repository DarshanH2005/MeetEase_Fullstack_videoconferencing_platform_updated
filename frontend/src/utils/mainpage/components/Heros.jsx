import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { styled } from "@mui/material/styles";
import BlurryBlob from "../../../components/ui/BlurryBlob";
import { useApp } from "../../../context/AppContext";

const StyledBox = styled("div")(({ theme }) => ({
  alignSelf: "center",
  width: "100%",
  height: 400,
  marginTop: theme.spacing(8),
  borderRadius: (theme.vars || theme).shape.borderRadius,
  outline: "6px solid",
  outlineColor: "hsla(220, 25%, 80%, 0.2)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.grey[200],
  boxShadow: "0 0 12px 8px hsla(220, 25%, 80%, 0.2)",

  backgroundSize: "cover",
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(10),
    height: 700,
  },
  ...theme.applyStyles("dark", {
    boxShadow: "0 0 24px 12px hsla(210, 100%, 25%, 0.2)",

    outlineColor: "hsla(220, 20%, 42%, 0.1)",
    borderColor: (theme.vars || theme).palette.grey[700],
  }),
}));

export default function Heros() {
  const { state } = useApp();
  const { isAuthenticated } = state;

  return (
    <Box
      id="hero"
      sx={(theme) => ({
        position: "relative",
        width: "100%",
        minHeight: { xs: "100vh", sm: "100vh" },
        backgroundRepeat: "no-repeat",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
        ...theme.applyStyles("dark", {
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
        }),
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      {/* Animated blurry blob background */}
      <BlurryBlob
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
        intensity="light"
        firstBlobColor="#667eea"
        secondBlobColor="#764ba2"
        thirdBlobColor="#60a5fa"
      />
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: { xs: 4, sm: 6 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          spacing={{ xs: 3, sm: 4 }}
          useFlexGap
          sx={{
            alignItems: "center",
            width: { xs: "100%", sm: "80%", md: "70%" },
            textAlign: "center",
            px: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="h1"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "center",
              fontSize: {
                xs: "clamp(2.5rem, 8vw, 3rem)",
                sm: "clamp(3rem, 10vw, 3.5rem)",
              },
              lineHeight: { xs: 1.2, sm: 1.1 },
              textAlign: "center",
              mb: { xs: 2, sm: 1 },
            }}
          >
            Connect Virtually&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: "inherit",
                color: "primary.main",
                ...theme.applyStyles("dark", {
                  color: "primary.light",
                }),
              })}
            >
              Anywhere
            </Typography>
          </Typography>
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { xs: "100%", sm: "100%", md: "80%" },
              fontSize: { xs: "1rem", sm: "1.1rem" },
              lineHeight: { xs: 1.5, sm: 1.6 },
              mb: { xs: 2, sm: 1 },
            }}
          >
            Discover our innovative video conferencing platform, designed to
            bring people together seamlessly. Experience crystal-clear video and
            audio quality, interactive features, and secure connections to
            enhance your meetings, webinars, and virtual events.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 2 }}
            useFlexGap
            sx={{
              pt: { xs: 2, sm: 3 },
              width: { xs: "100%", sm: "auto" },
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InputLabel htmlFor="email-hero" sx={visuallyHidden}>
              Link
            </InputLabel>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                maxWidth: { xs: "320px", sm: "500px" },
              }}
            >
              {isAuthenticated ? (
                // Show Join/Create Meeting buttons for authenticated users
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    href="/join"
                    sx={{
                      minWidth: { xs: "280px", sm: "fit-content" },
                      minHeight: "48px",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    Join a Meeting
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    href="/start"
                    sx={{
                      minWidth: { xs: "280px", sm: "fit-content" },
                      minHeight: "48px",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    Create Meeting
                  </Button>
                </>
              ) : (
                // Show Login/Signup buttons for non-authenticated users - pointing to your beautiful auth pages
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    href="/auth/login"
                    sx={{
                      minWidth: { xs: "280px", sm: "fit-content" },
                      minHeight: "48px",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    href="/auth/register"
                    sx={{
                      minWidth: { xs: "280px", sm: "fit-content" },
                      minHeight: "48px",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            {isAuthenticated ? (
              <>
                Ready to start or join your meetings.&nbsp;
                <Link href="#" color="primary">
                  Learn more
                </Link>
                .
              </>
            ) : (
              <>
                By clicking &quot;Sign Up&quot; you agree to our&nbsp;
                <Link href="#" color="primary">
                  Terms & Conditions
                </Link>
                .
              </>
            )}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
