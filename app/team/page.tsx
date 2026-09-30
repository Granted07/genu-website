import type { Metadata } from "next";

import TeamRoster, {
  type CSuiteMember,
} from "@/components/team/team-roster.client";
import { logger } from "@/lib/logger";
import { getSupabasePublic } from "@/lib/supabase";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Team | Gen Uprising",
  description: "The people who run Generation Uprising.",
};

async function getCSuite(): Promise<{
  members: CSuiteMember[];
  errorMessage: string | null;
}> {
  try {
    const { data, error } = await getSupabasePublic()
      .from("csuite")
      .select("id, name, position")
      .order("id", { ascending: true })
      .abortSignal(AbortSignal.timeout(8000));

    if (error) throw error;

    const members = (Array.isArray(data) ? data : [])
      .map((row) => ({
        id: Number(row.id),
        name: typeof row.name === "string" ? row.name.trim() : "",
        position: typeof row.position === "string" ? row.position.trim() : "",
      }))
      .filter((member) => member.name.length > 0);

    return { members, errorMessage: null };
  } catch (error) {
    logger.error("team.csuite_fetch_failed", error);
    return {
      members: [],
      errorMessage: "Couldn't load the team. Refresh to try again.",
    };
  }
}

export default async function TeamPage() {
  const { members, errorMessage } = await getCSuite();
  return <TeamRoster members={members} errorMessage={errorMessage} />;
}