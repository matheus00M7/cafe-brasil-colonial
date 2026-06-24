import { redirect } from "next/navigation";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";
import { getCustomerSession } from "@/lib/customer-auth";

export default async function AccountDataPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/entrar");
  return <AccountProfileForm account={session.account} />;
}
