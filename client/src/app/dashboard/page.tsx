import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome, {data.user.email}</h1>
    </div>
  );
}

export default DashboardPage;
