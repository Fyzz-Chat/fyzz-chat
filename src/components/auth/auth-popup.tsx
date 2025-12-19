import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import { cn } from "@/lib/utils";

export default async function AuthPopup({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const translations = await getTranslations();
  const { login, register } = await searchParams;
  const isLogin = login === "true";
  const isRegister = register === "true";

  return (
    (isLogin || isRegister) && (
      <div
        className={cn(
          "fade-in slide-in-from-bottom-4 fixed inset-0 z-20 flex animate-in items-center justify-center backdrop-blur-xs duration-500"
        )}
      >
        <AuthCard
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
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </AuthCard>
      </div>
    )
  );
}
