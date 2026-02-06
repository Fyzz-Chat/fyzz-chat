"use client";

import { useParams } from "next/navigation";
import MockMessageList from "@/app/mock/[id]/message-list";

export default function MockPage() {
  const { id } = useParams<{ id: string }>();
  return <MockMessageList id={id} />;
}
