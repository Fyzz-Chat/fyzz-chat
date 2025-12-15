import { SidebarTrigger } from "@/components/ui/sidebar";
import NotificationMenu from "./notification-menu";

export default function TopMenu() {
  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <SidebarTrigger />
      <NotificationMenu />
    </div>
  );
}
