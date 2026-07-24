import { supabase } from "@/lib/supabase/client";

/**
 * Daily speaking prompts. Ported from mobile `src/utils/dailyPrompts.ts`
 * against the same `daily_prompts` table (user_id, prompt_text, prompt_date,
 * is_used, used_at). Colocated here since it's only used by the record page.
 */
export interface DailyPromptItem {
  id: string;
  prompt_text: string;
  is_used: boolean;
  used_at?: string | null;
}

const PROMPT_TEMPLATES = [
  "Share a traditional greeting from your culture",
  "Tell us about your favorite childhood memory",
  "Describe your hometown in your native language",
  "Share a family recipe or cooking tradition",
  "Tell us about a local festival or celebration",
  "Describe the weather in your region today",
  "Share a proverb or saying from your language",
  "Tell us about a local landmark or place",
  "Describe your family traditions",
  "Share a story your grandparents told you",
  "Tell us about your favorite local food",
  "Describe a typical day in your community",
  "Share a traditional song or rhyme",
  "Tell us about local customs or etiquette",
  "Describe your favorite season and why",
  "Share a local legend or folktale",
  "Tell us about traditional clothing or dress",
  "Describe a local craft or skill",
  "Share a childhood game or activity",
  "Tell us about your language's unique features",
];

export async function generateDailyPrompts(
  userId: string,
  userLanguage?: string
): Promise<DailyPromptItem[]> {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data: existing, error: fetchError } = await supabase
      .from("daily_prompts")
      .select("*")
      .eq("user_id", userId)
      .eq("prompt_date", today);

    if (fetchError) {
      console.error("[dailyPrompts] fetch error:", fetchError);
      return [];
    }

    if (existing && existing.length >= 3) {
      return existing.map((p) => ({
        id: p.id,
        prompt_text: p.prompt_text,
        is_used: p.is_used,
        used_at: p.used_at,
      }));
    }

    const selected = [...PROMPT_TEMPLATES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((template) => {
        let personalized = template;
        if (userLanguage) {
          personalized = personalized.replace("your language", userLanguage);
          personalized = personalized.replace(
            "your culture",
            `${userLanguage} culture`
          );
        }
        return { prompt_text: personalized, prompt_date: today, user_id: userId };
      });

    const { data: inserted, error: insertError } = await supabase
      .from("daily_prompts")
      .insert(selected)
      .select();

    if (insertError) {
      console.error("[dailyPrompts] insert error:", insertError);
      return [];
    }

    return (
      inserted?.map((p) => ({
        id: p.id,
        prompt_text: p.prompt_text,
        is_used: p.is_used,
        used_at: p.used_at,
      })) ?? []
    );
  } catch (err) {
    console.error("[dailyPrompts] unexpected error:", err);
    return [];
  }
}

export async function markPromptAsUsed(promptId: string): Promise<void> {
  try {
    await supabase
      .from("daily_prompts")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("id", promptId);
  } catch (err) {
    console.error("[dailyPrompts] markPromptAsUsed error:", err);
  }
}
