import { auth } from "@/auth";
import { CardEditorWorkbench } from "@/components/dashboard/editor/CardEditorWorkbench";

function normalizeDefaultSlug(githubLogin: string | null) {
  if (!githubLogin) {
    return "my-card";
  }

  return githubLogin.trim().toLowerCase();
}

export default async function DashboardEditorPage() {
  const session = await auth();
  const githubLogin = session?.user.githubLogin ?? null;

  return <CardEditorWorkbench defaultSlug={normalizeDefaultSlug(githubLogin)} />;
}
