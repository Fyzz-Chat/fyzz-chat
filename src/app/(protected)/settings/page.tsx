import DeleteAccountForm from "@/components/settings/delete-account-form";
import { DisplaySettingsTab } from "@/components/settings/display-settings-tab";
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
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";
import { unstable_ViewTransition as ViewTransition } from "react";

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
    },
  });
  const hasPassword = Boolean(user?.password);

  return (
    <ViewTransition default="fade">
      <div className="relative flex flex-1 flex-col items-center justify-start pt-16 px-4 min-w-[320px] max-h-svh bg-background md:rounded-[20px]">
        <div className="flex flex-col gap-4 w-full max-w-xl">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          <Tabs defaultValue="memory" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="memory" className="space-x-2">
                <span>Memory</span>
              </TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
            </TabsList>
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
          </Tabs>
        </div>
      </div>
    </ViewTransition>
  );
}
