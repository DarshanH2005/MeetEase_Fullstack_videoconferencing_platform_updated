import React from 'react';
import SignupForm from '../components/auth/SignupForm';
import Head from 'next/head';

export default function SignupPage() {
  return (
    <>
      <Head>
        <title>Sign Up - MeetEase</title>
        <meta name="description" content="Create your MeetEase account" />
      </Head>
      <SignupForm />
    </>
  );
}
