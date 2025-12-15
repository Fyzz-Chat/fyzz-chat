"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import LastUsedIndicator from "./last-used-indicator";

export default function OAuthButton({
  provider,
  title,
}: {
  provider: string;
  title: string;
}) {
  return (
    <Button
      type="submit"
      className="relative flex w-full items-center justify-center gap-3 bg-white text-black hover:bg-gray-100"
      onClick={() => {
        localStorage.setItem("fyzz-auth-method", provider);
      }}
    >
      <Image
        src={`/${provider}.svg`}
        width="20"
        height="20"
        alt={title}
        className="pointer-events-none"
      />
      <span className="pointer-events-none font-medium">{title}</span>
      <LastUsedIndicator provider={provider} />
    </Button>
  );
}
