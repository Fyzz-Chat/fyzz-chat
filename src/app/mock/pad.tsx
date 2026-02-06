"use client";

import { useParams } from "next/navigation";

export default function Pad() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (id) {
    return null;
  }

  return <div className="flex-1" />;
}
