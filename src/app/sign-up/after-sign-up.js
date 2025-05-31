// filepath: src/app/sign-up/after-sign-up.js
"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function AfterSignUpSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      fetch("/api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        }),
      });
    }
  }, [isLoaded, user]);

  return null;
}