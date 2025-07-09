import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import ChatWelcomeSection from "@/components/chat/chat-welcome-section";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
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
  const translations = await getTranslations();
  const user = await getUserFromSessionPublic();
  const { login, register } = await searchParams;
  const isLogin = login === "true";
  const isRegister = register === "true";

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ViewTransitionWrapper className="flex flex-1 items-center justify-center">
        <div className="max-w-2xl w-full space-y-4">
          <ChatWelcomeSection user={user} translations={translations.home}>
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
            title={isLogin ? translations.login.title : translations.register.title}
            description={
              isLogin ? translations.login.description : translations.register.description
            }
            ctaQuestion={
              isLogin
                ? translations.login.firstTime.title
                : translations.register.alreadyHaveAccount.title
            }
            ctaText={
              isLogin
                ? translations.login.firstTime.link
                : translations.register.alreadyHaveAccount.link
            }
            ctaLink={`/chat?${isLogin ? "register=true" : "login=true"}`}
          >
            {isLogin ? (
              <LoginForm translations={translations.login} />
            ) : (
              <RegisterForm translations={translations.register} />
            )}
          </LazyAuthCard>
        </div>
      )}
    </div>
  );
}
