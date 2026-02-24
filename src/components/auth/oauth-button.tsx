"use client";

import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { Fragment } from "react";
import LastUsedIndicator from "@/components/auth/last-used-indicator";
import { Button } from "@/components/ui/button";

export default function OAuthButton({
  provider,
  title,
  isLoading,
}: Readonly<{
  provider: string;
  title: string;
  isLoading?: boolean;
}>) {
  return (
    <Button
      type="submit"
      size="lg"
      className="relative flex h-12 w-full items-center justify-center gap-3 bg-white text-black hover:bg-gray-100"
      disabled={isLoading}
    >
      {isLoading ? (
        <LoaderCircle className="animate-spin" size={18} />
      ) : (
        <Fragment>
          <Image
            src={`/${provider}.svg`}
            width="20"
            height="20"
            alt={title}
            className="pointer-events-none"
          />
          <span className="pointer-events-none font-medium">{title}</span>
          <LastUsedIndicator provider={provider} />
        </Fragment>
      )}
    </Button>
  );
}
