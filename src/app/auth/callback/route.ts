import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/discover"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Bei neuem OAuth-User: display_name aus Discord-Profil setzen
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, riot_name")
        .eq("id", data.user.id)
        .single()

      // Discord gibt username/full_name als user_metadata
      const discordName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.user_metadata?.custom_claims?.global_name ||
        data.user.email?.split("@")[0] ||
        "Spieler"

      const discordAvatar = data.user.user_metadata?.avatar_url

      // Nur updaten wenn noch kein riot_name gesetzt (frischer User)
      if (!profile?.riot_name || profile.display_name === data.user.email?.split("@")[0]) {
        await supabase.from("profiles").update({
          display_name: discordName,
          ...(discordAvatar ? { avatar_url: discordAvatar } : {}),
        }).eq("id", data.user.id)
      }

      // Neuer User → Onboarding, bestehender → Discover
      const isNewUser = !profile?.riot_name
      return NextResponse.redirect(`${origin}${isNewUser ? "/onboarding" : next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`)
}
