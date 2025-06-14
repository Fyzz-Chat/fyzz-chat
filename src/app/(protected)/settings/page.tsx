import DeleteAccountForm from "@/components/settings/delete-account-form";
import { DisplaySettingsTab } from "@/components/settings/display-settings-tab";
import { McpTab } from "@/components/settings/mcp-tab";
import MemoryForm from "@/components/settings/memory-form";
import PasswordForm from "@/components/settings/password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";

export default async function SettingsPage() {
  const userId = await getUserIdFromSession();
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      password: true,
      memory: true,
      memoryEnabled: true,
      mcpServers: true,
    },
  });
  const hasPassword = Boolean(user?.password);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-start pt-16 px-4 min-w-[320px] bg-background md:rounded-[20px]">
      <ViewTransitionWrapper className="flex flex-1 w-full">
        <div className="flex flex-col gap-4 w-full max-w-xl mx-auto pb-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          <Tabs defaultValue="memory" className="w-full">
            <div className="overflow-x-auto md:overflow-x-visible">
              <TabsList className="flex w-full min-w-max gap-2 md:grid md:grid-cols-5 md:gap-0 px-1">
                <TabsTrigger value="memory" className="flex-shrink-0 min-w-20 px-3">
                  Memory
                </TabsTrigger>
                <TabsTrigger value="security" className="flex-shrink-0 min-w-20 px-3">
                  Security
                </TabsTrigger>
                <TabsTrigger value="account" className="flex-shrink-0 min-w-20 px-3">
                  Account
                </TabsTrigger>
                <TabsTrigger value="display" className="flex-shrink-0 min-w-20 px-3">
                  Display
                </TabsTrigger>
                <TabsTrigger value="mcp" className="flex-shrink-0 min-w-20 px-3">
                  MCP
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="memory">
              <Card className="mb-5">
                <ScrollArea>
                  <CardHeader>
                    <CardTitle>Memory Settings</CardTitle>
                    <CardDescription>
                      Control how the application remembers your interactions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MemoryForm
                      memory={user?.memory ?? undefined}
                      memoryEnabled={user?.memoryEnabled ?? false}
                    />
                  </CardContent>
                </ScrollArea>
              </Card>
            </TabsContent>
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>You can change your password here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordForm hasPassword={hasPassword} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>You can delete your account here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeleteAccountForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="display">
              <DisplaySettingsTab />
            </TabsContent>
            <TabsContent value="mcp">
              <McpTab userMcpServers={user?.mcpServers} />
            </TabsContent>
          </Tabs>
        </div>
      </ViewTransitionWrapper>
    </div>
  );
}
