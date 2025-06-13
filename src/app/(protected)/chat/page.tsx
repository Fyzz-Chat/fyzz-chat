import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import ChatWelcomeSection from "@/components/chat/chat-welcome-section";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const LazyIntroDialog = dynamic(() => import("@/components/chat/intro-dialog"));

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { login, register } = await searchParams;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ViewTransitionWrapper>
        <div className="max-w-xl w-full space-y-4">
          <ChatWelcomeSection>
            <LazyIntroDialog />
          </ChatWelcomeSection>
        </div>
      </ViewTransitionWrapper>
      <div
        className={cn(
          "hidden fixed items-center justify-center inset-0 backdrop-blur-sm z-20 animate-in fade-in slide-in-from-bottom-4 duration-500",
          (login === "true" || register === "true") && "flex"
        )}
      >
        <AuthCard
          title={login === "true" ? "Welcome back!" : "Let's get started!"}
          description={
            login === "true"
              ? "Sign in to your account to continue"
              : "Create an account to continue"
          }
          ctaQuestion={login === "true" ? "First time here?" : "Already have an account?"}
          ctaText={login === "true" ? "Sign up" : "Login"}
          ctaLink={`/chat?${login === "true" ? "register=true" : "login=true"}`}
        >
          {login === "true" ? <LoginForm /> : <RegisterForm />}
        </AuthCard>
      </div>
    </div>
  );
}
