import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import ChatWelcomeSection from "@/components/chat/chat-welcome-section";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";
import { getUserFromSessionPublic } from "@/lib/dao/users";
import { canonicalUrl, metaDescription, metaTitle, openGraph } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const LazyIntroDialog = dynamic(() => import("@/components/chat/intro-dialog"));
const LazyAuthCard = dynamic(() => import("@/components/auth/auth-card"));

const path = "/chat";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: {
    canonical: `${canonicalUrl}${path}`,
  },
  openGraph: {
    ...openGraph,
    title: metaTitle,
    description: metaDescription,
    url: path,
  },
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getUserFromSessionPublic();
  const { login, register } = await searchParams;
  const isLogin = login === "true";
  const isRegister = register === "true";

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ViewTransitionWrapper className="flex flex-1 items-center justify-center">
        <div className="max-w-2xl w-full space-y-4">
          <ChatWelcomeSection user={user}>
            <LazyIntroDialog />
          </ChatWelcomeSection>
        </div>
      </ViewTransitionWrapper>
      {(isLogin || isRegister) && (
        <div
          className={cn(
            "flex fixed items-center justify-center inset-0 backdrop-blur-sm z-20 animate-in fade-in slide-in-from-bottom-4 duration-500"
          )}
        >
          <LazyAuthCard
            title={isLogin ? "Welcome back!" : "Let's get started!"}
            description={
              isLogin
                ? "Sign in to your account to continue"
                : "Create an account to continue"
            }
            ctaQuestion={isLogin ? "First time here?" : "Already have an account?"}
            ctaText={isLogin ? "Sign up" : "Login"}
            ctaLink={`/chat?${isLogin ? "register=true" : "login=true"}`}
          >
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </LazyAuthCard>
        </div>
      )}
    </div>
  );
}
