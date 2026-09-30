import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DIVISIONS = [
  "MR",
  "HRD",
  "Finance",
  "NOC",
  "Keuangan",
  "Procurement",
  "Customer Care",
  "Corporate & Government Technical Support",
  "OPJ",
  "PPJ",
  "Help Desk",
  "Sales Retail",
  "Sales Corporate & Government",
  "Legal",
  "Marketing",
] as const;

export type Role = "manager" | "spv" | "staf";
export const ROLE_LABEL: Record<Role, string> = { manager: "Manager", spv: "SPV", staf: "Staf" };

export function divisionShort(division: string) {
  const map: Record<string, string> = {
    "Customer Care": "CC",
    "Corporate & Government Technical Support": "CGTS",
    "Help Desk": "HD",
    "Sales Retail": "SR",
    "Sales Corporate & Government": "SCG",
    Procurement: "PRC",
    Keuangan: "KEU",
    Finance: "FIN",
    Marketing: "MKT",
    Legal: "LGL",
  };
  return map[division] ?? division;
}

const AVATAR_CLASSES = ["avatar-finance", "avatar-hr", "avatar-it", "avatar-ops", "avatar-sales", "avatar-support"];
export function divisionClass(division: string) {
  const index = DIVISIONS.indexOf(division as (typeof DIVISIONS)[number]);
  return AVATAR_CLASSES[(index < 0 ? 0 : index) % AVATAR_CLASSES.length] ?? "avatar-it";
}

export type Me = { id: string; email: string; name: string; division: string; role: Role };

export async function fetchMe(): Promise<Me | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const [{ data: profile }, { data: role }] = await Promise.all([
    supabase.from("profiles").select("display_name, division").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
  ]);
  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.display_name || user.email?.split("@")[0] || "Pengguna",
    division: profile?.division ?? "HRD",
    role: (role?.role as Role | undefined) ?? "staf",
  };
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 60_000 });
}
