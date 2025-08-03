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
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";
import { Brain, Monitor, Puzzle, Shield, User } from "lucide-react";

export default async function SettingsPage() {
  const translations = await getTranslations();
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
    <div className="relative flex flex-1 flex-col items-center justify-start pt-16 px-4 min-w-[320px] md:max-h-[calc(100svh-1rem)] bg-background md:rounded-[20px]">
      <ViewTransitionWrapper className="flex flex-1 w-full md:overflow-y-auto">
        <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{translations.settings.title}</h1>
            <p className="text-sm text-muted-foreground">
              {translations.settings.description}
            </p>
          </div>
          <Tabs defaultValue="memory" className="w-full pb-5">
            <div className="overflow-x-auto md:overflow-x-visible">
              <TabsList className="grid grid-cols-3 w-full md:grid-cols-5 md:gap-0 px-1 h-auto">
                <TabsTrigger
                  value="memory"
                  className="flex items-center justify-center min-w-20 px-3 py-2"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {translations.settings.memory.tabTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center justify-center min-w-20 px-3 py-2"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {translations.settings.security.tabTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="flex items-center justify-center min-w-20 px-3 py-2"
                >
                  <User className="w-4 h-4 mr-2" />
                  {translations.settings.account.tabTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="display"
                  className="flex items-center justify-center min-w-20 px-3 py-2"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  {translations.settings.display.tabTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="mcp"
                  className="flex items-center justify-center min-w-20 px-3 py-2"
                >
                  <Puzzle className="w-4 h-4 mr-2" />
                  MCP
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="memory">
              <Card>
                <ScrollArea>
                  <CardHeader>
                    <CardTitle>{translations.settings.memory.title}</CardTitle>
                    <CardDescription>
                      {translations.settings.memory.description}
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
                  <CardTitle>{translations.settings.security.title}</CardTitle>
                  <CardDescription>
                    {translations.settings.security.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordForm hasPassword={hasPassword} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>{translations.settings.account.title}</CardTitle>
                  <CardDescription>
                    {translations.settings.account.description}
                  </CardDescription>
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
