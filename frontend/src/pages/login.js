import React from "react";
import LoginForm from "../components/auth/LoginForm_new";
import Head from "next/head";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - MeetEase</title>
        <meta name="description" content="Sign in to your MeetEase account" />
      </Head>
      <LoginForm />
    </>
  );
}
