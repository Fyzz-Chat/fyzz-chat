"use client";

import type { ReactNode } from "react";
import { use, useEffect, useState } from "react";
import ExampleButton from "@/components/chat/example-button";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useModelStore } from "@/stores/model-store";
import IconSpy from "../icons/icon-spy";

function getRandomWelcomeMessage(messages: string[]) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

export default function ChatWelcomeSection({ children }: { children?: ReactNode }) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(getRandomWelcomeMessage(translations.home.welcome.messages));
  }, [translations]);

  if (temporaryChat) {
    return (
      <div className="mx-auto flex w-fit flex-col items-start gap-4 rounded-lg border border-muted bg-muted/30 px-6 py-6 lg:px-14">
        <div className="flex w-full shrink-0 flex-col items-center justify-center gap-2 text-muted-foreground">
          <IconSpy size={50} />
          <h3 className="mb-5 font-bold text-3xl text-muted-foreground">
            {translations.home.incognito.title}
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          <p>{translations.home.incognito.intro}</p>
          <ul className="space-y-3 text-muted-foreground/80 text-sm">
            {translations.home.incognito.list.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-bold text-4xl">{message}</h1>
      {children}
      <ul className="flex flex-col">
        {translations.home.welcome.examples.map((example) => (
          <li
            key={example}
            className="border-b py-1.5 text-muted-foreground last:border-b-0"
          >
            <ExampleButton example={example} />
          </li>
        ))}
      </ul>
    </>
  );
}
