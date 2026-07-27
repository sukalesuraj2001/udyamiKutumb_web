import React from "react";
import PendingAppreciations from "./PendingAppreciations.jsx";
import AppreciationWall from "./AppreciationWall.jsx";

// Replace with real data from your API
const PENDING_APPRECIATIONS = [];
const PUBLISHED_APPRECIATIONS = [];

export default function MemberReviews() {
  return (
    <div className="space-y-8">
      <PendingAppreciations items={PENDING_APPRECIATIONS} />
      <AppreciationWall appreciations={PUBLISHED_APPRECIATIONS} />
    </div>
  );
}