"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signInAnonymously } from "@/lib/actions/users";
import publicConf from "@/lib/public-config";

export default function AnonymousLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInAnonymously();
      if (result.success) {
        queryClient.clear();
        router.push(publicConf.redirectPath);
      } else {
        toast.error(result.message, {
          description: result.description,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className="h-12 w-full"
      onClick={handleAnonymousLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <LoaderCircle className="animate-spin" size={18} />
      ) : (
        <span>Anonymous Login</span>
      )}
    </Button>
  );
}
