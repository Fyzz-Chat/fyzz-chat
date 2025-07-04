"use client";

import ExampleButton from "@/components/chat/example-button";
import ModelSetter from "@/components/chat/model-setter";
import type { SessionUser } from "@/lib/dao/users";
import { useModelStore } from "@/stores/model-store";
import type { Dictionary } from "@/types/locale";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import IconSpy from "../icons/icon-spy";

const examples = [
  "105 degrees Fahrenheit to Celsius ",
  "Where do llamas live naturally? ",
  "What is the smallest country in Africa? ",
  "How can you help me? ",
];

const welcomeMessages = [
  "Ready to achieve, {name}?",
  "Let's get after it, {name}!",
  "Time to excel, {name}!",
  "{name}, let's make progress!",
];

function getRandomWelcomeMessage(userName: string) {
  const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
  return welcomeMessages[randomIndex].replace("{name}", userName);
}

export default function ChatWelcomeSection({
  children,
  user,
  home,
}: { children?: ReactNode; user: SessionUser | null; home: Dictionary["home"] }) {
  const { incognito } = home;
  const { temporaryChat } = useModelStore();
  const [message, setMessage] = useState<string>("Chat with me");

  useEffect(() => {
    if (user) {
      setMessage(getRandomWelcomeMessage(user.name));
    }
  }, [user]);

  if (temporaryChat) {
    return (
      <div className="flex items-start mx-auto flex-col gap-4 py-6 px-6 lg:px-14 bg-muted/30 border border-muted rounded-lg w-fit">
        <div className="flex-shrink-0 text-muted-foreground gap-2 flex flex-col justify-center items-center w-full ">
          <IconSpy size={50} />
          <h3 className="text-3xl font-bold text-muted-foreground mb-5">
            {incognito.title}
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          <p>{incognito.intro}</p>
          <ul className="text-sm text-muted-foreground/80 space-y-3">
            {incognito.list.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold">{message}</h1>
      {children}
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
    </>
  );
}
