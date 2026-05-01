import {
  ArrowLeft,
  Brain,
  Key,
  LightbulbIcon,
  Monitor,
  Puzzle,
  Shield,
  User,
} from "lucide-react";
import { Suspense } from "react";
import { FastLink } from "@/components/fast-link";
import { ApiKeysTab } from "@/components/settings/api-keys-tab";
import DeleteAccountForm from "@/components/settings/delete-account-form";
import { DisplaySettingsTab } from "@/components/settings/display-settings-tab";
import { McpTab } from "@/components/settings/mcp-tab";
import DefaultModelSelect from "@/components/settings/memory/default-model-select";
import MemoryListSection from "@/components/settings/memory/memory-list-section";
import MemoryToggle from "@/components/settings/memory/memory-toggle";
import PersonaInput from "@/components/settings/memory/persona-input";
import PasswordForm from "@/components/settings/password-form";
import SkillsForm from "@/components/settings/skills-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import { getProvidersPublic } from "@/lib/backend/providers";
import { getApiKeysByUser } from "@/lib/dao/api-keys";
import { getAllUserMemoriesGrouped } from "@/lib/dao/memories";
import { getAllUserSkillsForSettings } from "@/lib/dao/skills";
import { getUserIdFromSession, getUserSettingsProfile } from "@/lib/dao/users";

export default async function SettingsPage() {
  const [translations, userId] = await Promise.all([
    getTranslations(),
    getUserIdFromSession(),
  ]);

  return (
    <div className="flex min-w-[320px] flex-1 flex-col items-center justify-start bg-background p-4 md:max-h-[calc(100svh-1rem)] md:rounded-[20px]">
      <ViewTransitionWrapper className="relative flex w-full flex-1 items-start justify-center pt-10 md:overflow-y-auto">
        <FastLink
          href="/chat"
          className="absolute top-0 left-0 flex items-center justify-start gap-2"
        >
          <ArrowLeft size={20} />
          <p className="text-muted-foreground text-sm">Back to chat</p>
        </FastLink>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl">{translations.settings.title}</h1>
            <p className="text-muted-foreground text-sm">
              {translations.settings.description}
            </p>
          </div>
          <Tabs defaultValue="memory" className="w-full pb-5">
            <div className="overflow-x-auto md:overflow-x-visible">
              <TabsList className="grid h-auto w-full grid-cols-3 px-1 md:grid-cols-7 md:gap-0">
                <TabsTrigger
                  value="memory"
                  className="flex min-w-20 items-center justify-center px-3 py-2"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  {translations.settings.memory.tabTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex min-w-20 items-center justify-center px-3 py-2"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {translations.settings.security.tabTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="flex min-w-20 items-center justify-center px-3 py-2"
                >
                  <User className="mr-2 h-4 w-4" />
                  {translations.settings.account.tabTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="display"
                  className="flex min-w-20 items-center justify-center px-3 py-2"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  {translations.settings.display.tabTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="api-keys"
                  className="flex min-w-20 items-center justify-center px-3 py-2"
                >
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger
                  value="mcp"
                  className="flex min-w-20 items-center justify-center px-3 py-2"
                >
                  <Puzzle className="mr-2 h-4 w-4" />
                  MCP
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="flex min-w-20 items-center justify-center px-3 py-2"
                >
                  <LightbulbIcon className="mr-2 h-4 w-4" />
                  Skills
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
                    <div className="flex flex-col items-start gap-4">
                      <h4 className="font-medium text-sm">
                        {translations.settings.memory.defaultModel.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {translations.settings.memory.defaultModel.description}
                      </p>
                      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                        <DefaultModelSelectLoader userId={userId} />
                      </Suspense>

                      <h4 className="font-medium text-sm">
                        {translations.settings.memory.sectionTitle}
                      </h4>
                      <Suspense
                        fallback={
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-11 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        }
                      >
                        <MemoryToggleLoader userId={userId} />
                      </Suspense>
                      <p className="text-muted-foreground text-sm">
                        {translations.settings.memory.toggle.description}
                      </p>

                      <div className="grid w-full gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="display-name">Your name</Label>
                          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                            <PersonaInputLoader userId={userId} field="displayName" />
                          </Suspense>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="agent-name">Agent name</Label>
                          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                            <PersonaInputLoader userId={userId} field="agentName" />
                          </Suspense>
                        </div>
                      </div>

                      <div className="w-full">
                        <Suspense
                          fallback={
                            <div className="flex flex-col gap-2">
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                            </div>
                          }
                        >
                          <MemoryListLoader userId={userId} />
                        </Suspense>
                      </div>
                    </div>
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
                  <Suspense fallback={<SecurityTabSkeleton />}>
                    <SecurityTab userId={userId} />
                  </Suspense>
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
            <TabsContent value="api-keys">
              <Suspense fallback={<ApiKeysTabSkeleton />}>
                <ApiKeysTabLoader userId={userId} />
              </Suspense>
            </TabsContent>
            <TabsContent value="mcp">
              <Suspense fallback={<McpTabSkeleton />}>
                <McpTabLoader userId={userId} />
              </Suspense>
            </TabsContent>
            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>
                    Reusable instruction sets the AI activates based on your request.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<SkillsTabSkeleton />}>
                    <SkillsTabLoader userId={userId} />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ViewTransitionWrapper>
    </div>
  );
}

async function DefaultModelSelectLoader({ userId }: { userId: string }) {
  const profile = await getUserSettingsProfile(userId);
  const providers = getProvidersPublic();
  return (
    <DefaultModelSelect
      defaultModel={profile?.defaultModel ?? undefined}
      providers={providers}
    />
  );
}

async function MemoryToggleLoader({ userId }: { userId: string }) {
  const profile = await getUserSettingsProfile(userId);
  return <MemoryToggle initialEnabled={profile?.memoryEnabled ?? false} />;
}

async function PersonaInputLoader({
  userId,
  field,
}: {
  userId: string;
  field: "displayName" | "agentName";
}) {
  const profile = await getUserSettingsProfile(userId);
  const initialValue =
    field === "displayName"
      ? (profile?.displayName ?? null)
      : (profile?.agentName ?? null);
  return <PersonaInput field={field} initialValue={initialValue} />;
}

async function MemoryListLoader({ userId }: { userId: string }) {
  const memories = await getAllUserMemoriesGrouped(userId);
  return <MemoryListSection initialMemories={memories} />;
}

async function SecurityTab({ userId }: { userId: string }) {
  const profile = await getUserSettingsProfile(userId);
  return <PasswordForm hasPassword={profile?.hasPassword ?? false} />;
}

async function ApiKeysTabLoader({ userId }: { userId: string }) {
  const apiKeys = await getApiKeysByUser(userId);
  return <ApiKeysTab initialKeys={apiKeys} />;
}

async function McpTabLoader({ userId }: { userId: string }) {
  const profile = await getUserSettingsProfile(userId);
  return <McpTab userMcpServers={profile?.mcpServers} />;
}

async function SkillsTabLoader({ userId }: { userId: string }) {
  const [profile, skills] = await Promise.all([
    getUserSettingsProfile(userId),
    getAllUserSkillsForSettings(userId),
  ]);
  return (
    <SkillsForm
      initialSkills={skills}
      initialSkillsEnabled={profile?.skillsEnabled ?? false}
    />
  );
}

function SecurityTabSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

const API_KEYS_KEYS = ["k1", "k2", "k3"];

function ApiKeysTabSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      {API_KEYS_KEYS.map((key) => (
        <Skeleton key={key} className="h-16 w-full" />
      ))}
    </div>
  );
}

const MCP_KEYS = ["mc1", "mc2"];

function McpTabSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      <Skeleton className="h-9 w-32" />
      {MCP_KEYS.map((key) => (
        <Skeleton key={key} className="h-20 w-full" />
      ))}
    </div>
  );
}

const SKILLS_KEYS = ["s1", "s2", "s3", "s4"];

function SkillsTabSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      <Skeleton className="h-6 w-48" />
      {SKILLS_KEYS.map((key) => (
        <Skeleton key={key} className="h-14 w-full" />
      ))}
    </div>
  );
}
