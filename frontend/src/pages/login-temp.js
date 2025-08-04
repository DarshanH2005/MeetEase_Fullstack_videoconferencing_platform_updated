import React from "react";
import Head from "next/head";
import { Box, Typography, Button } from "@mui/material";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - MeetEase</title>
        <meta name="description" content="Sign in to your MeetEase account" />
      </Head>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h4">Login Page</Typography>
        <Button variant="contained">Temporary Login Button</Button>
        <Typography variant="body2">
          Login functionality will be restored after build fix
        </Typography>
      </Box>
    </>
  );
}
