"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // ✅ TS now knows currentUser is NOT null
    const currentUser = user;

    async function syncUser() {
      try {
        await fetch("/api/newuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkUserId: currentUser.id,
            email: currentUser.primaryEmailAddress?.emailAddress,
            name: currentUser.fullName ?? "",
            imageUrl: currentUser.imageUrl ?? "",
          }),
        });
      } catch (err) {
        console.error("User sync failed:", err);
      }
    }

    syncUser();
  }, [isLoaded, user]);

  return null;
}