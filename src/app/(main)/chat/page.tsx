import { redirect } from "next/navigation";
import ChatLanding from "@/components/chat/chat-landing";
import conf from "@/lib/config";
import { getUserFromSessionPublic } from "@/lib/dao/users";

export default async function ChatPage() {
  if (conf.onboardingEnabled) {
    const user = await getUserFromSessionPublic();
    if (user && !user.onboardingCompletedAt) redirect("/onboarding");
  }

  return <ChatLanding />;
}
