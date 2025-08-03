"use client";

import V2IdPage from "@/components/v2/v2-id-page";
import V2Page from "@/components/v2/v2-page";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function ClientRouter({
  jwtConfigured,
}: {
  jwtConfigured: boolean;
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
      </Routes>
    </BrowserRouter>
  );
}
