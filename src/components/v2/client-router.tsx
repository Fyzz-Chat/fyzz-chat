"use client";

import V2IdPage from "@/components/v2/v2-id-page";
import V2Page from "@/components/v2/v2-page";
import ChatLayout from "@/components/v3/chat-layout";
import V3IdPage from "@/components/v3/v3-id-page";
import V3Page from "@/components/v3/v3-page";
import { type ReactNode, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function ClientRouter({
  jwtConfigured,
  children,
}: {
  jwtConfigured: boolean;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/v2/:id" element={<V2IdPage jwtConfigured={jwtConfigured} />} />
        <Route path="/v2" element={<V2Page />} />
        <Route path="/v3" element={children}>
          <Route path="chat" element={<ChatLayout />}>
            <Route path=":id" element={<V3IdPage jwtConfigured={jwtConfigured} />} />
            <Route path="" element={<V3Page />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
