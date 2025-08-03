import ViewTransitionWrapper from "@/components/view-transition-wrapper";
import { useTranslations } from "@/lib/contexts/translations-context";
import { use } from "react";

export default function V2Page() {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ViewTransitionWrapper className="flex flex-1 items-center justify-center">
        <div>{translations.home.welcome.messages[0]}</div>
      </ViewTransitionWrapper>
    </div>
  );
}
