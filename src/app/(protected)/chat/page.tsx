import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import ExampleButton from "@/components/chat/example-button";
import ModelSetter from "@/components/chat/model-setter";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const LazyIntroDialog = dynamic(() => import("@/components/chat/intro-dialog"));

const examples = [
  "105 degrees Fahrenheit to Celsius ",
  "Where do llamas live naturally? ",
  "What is the smallest country in Africa? ",
  "How can you help me? ",
];

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { login, register } = await searchParams;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-4">
        <h1 className="text-4xl font-bold">Chat with me</h1>
        <LazyIntroDialog />
        <ul className="flex flex-col">
          {examples.map((example) => (
            <li
              key={example}
              className="border-b py-1.5 last:border-b-0 text-muted-foreground"
            >
              <ExampleButton example={example} />
            </li>
          ))}
        </ul>
        <ModelSetter />
      </div>
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
