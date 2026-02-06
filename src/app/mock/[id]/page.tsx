import MockMessageList from "@/app/mock/[id]/message-list";

export default async function MockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MockMessageList id={id} />;
}
