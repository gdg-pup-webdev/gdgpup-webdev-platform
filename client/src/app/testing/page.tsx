"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import Link from "next/link";
import React from "react";

const page = () => {
  const authContext = useAuthContext();
  console.log(authContext);

  return (
    <>
      <div>testing page page</div>
      <Link href="/">Go to home page</Link>
      <pre>{JSON.stringify(authContext, null, 2)}</pre>
      <button
        className="p-2 border rounded-2xl bg-greenn-200"
        onClick={authContext.loginWithGoogle}
      >
        login with google{" "}
      </button>
      <button
        className="p-2 border rounded-2xl bg-red-200"
        onClick={authContext.logout}
      >
        logout
      </button>
    </>
  );
};

export default page;
