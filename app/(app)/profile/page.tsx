import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";

export default async function MyProfilePage() {
  const user = await requireOnboardedUser();
  redirect(`/profile/${user.profile?.username}`);
}
