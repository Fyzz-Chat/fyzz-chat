import ViewTransitionWrapper from "@/components/view-transition-wrapper";
import type { Translations } from "@/types/locale";

export default function V2Page({ translations }: { translations: Translations }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ViewTransitionWrapper className="flex flex-1 items-center justify-center">
        <div>{translations.home.welcome.messages[0]}</div>
      </ViewTransitionWrapper>
    </div>
  );
}
