"use client";

import { Route, Routes } from "@/components/v4/client-router";
import V4IdPage from "@/components/v4/v4-id-page";
import V4Page from "@/components/v4/v4-page";

export default function V4Routes() {
  return (
    <Routes>
      <Route path="/v4/chat" component={V4Page} />
      <Route path="/v4/chat/:id" component={V4IdPage} />
    </Routes>
  );
}
