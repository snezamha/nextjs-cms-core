"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="container py-6">
      <UserProfile />
    </div>
  );
}
