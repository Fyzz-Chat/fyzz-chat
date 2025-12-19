import Image from "next/image";
import InputForm from "@/components/input-form/input-form";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";

export default function V3Page() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <ViewTransitionWrapper className="flex h-full max-w-2xl flex-1 flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center gap-2">
          <Image src="/icon.svg" alt="Fyzz.chat" width={48} height={48} />
          <p className="font-bold text-2xl">Fyzz.chat</p>
        </div>
        <InputForm className="fixed bottom-0 sm:relative" />
      </ViewTransitionWrapper>
    </div>
  );
}
