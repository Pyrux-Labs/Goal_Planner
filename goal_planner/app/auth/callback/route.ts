import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants/routes";

const DEFAULT_PROFILE_PICTURE =
    "https://jbfzvoxddrydtawekviz.supabase.co/storage/v1/object/public/profile_pictures/default.jpg";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(`${origin}${ROUTES.LANDING}`);
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options),
                    );
                },
            },
        },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
        return NextResponse.redirect(`${origin}${ROUTES.LANDING}`);
    }

    const userId = data.user.id;

    // Check if user exists in users table
    const { data: existingUser } = await supabase
        .from("users")
        .select("id, profile_picture")
        .eq("id", userId)
        .single();

    const isNewUser = !existingUser;

    // Create user row if it doesn't exist
    if (isNewUser) {
        await supabase.from("users").insert({
            id: userId,
            fullname:
                data.user.user_metadata?.full_name ||
                data.user.email ||
                "",
            email: data.user.email || "",
            profile_picture: DEFAULT_PROFILE_PICTURE,
        });
    }

    // Upload Google avatar if user has default picture
    const googleAvatar =
        data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture;
    const hasDefaultPicture =
        isNewUser ||
        existingUser?.profile_picture === DEFAULT_PROFILE_PICTURE;

    if (hasDefaultPicture && googleAvatar) {
        try {
            const avatarResponse = await fetch(googleAvatar);
            if (avatarResponse.ok) {
                const arrayBuffer = await avatarResponse.arrayBuffer();
                const fileName = `${userId}/google-avatar.jpg`;

                const { error: uploadError } = await supabase.storage
                    .from("profile_pictures")
                    .upload(fileName, arrayBuffer, {
                        contentType: "image/jpeg",
                        upsert: true,
                    });

                if (!uploadError) {
                    const { data: publicUrlData } = supabase.storage
                        .from("profile_pictures")
                        .getPublicUrl(fileName);

                    if (publicUrlData?.publicUrl) {
                        await supabase
                            .from("users")
                            .update({
                                profile_picture: publicUrlData.publicUrl,
                            })
                            .eq("id", userId);
                    }
                }
            }
        } catch (err) {
            // Non-critical: avatar upload failed, continue with redirect
            console.error("Error uploading Google avatar:", err);
        }
    }

    // New users → onboarding, existing users → calendar
    if (isNewUser) {
        return NextResponse.redirect(`${origin}${ROUTES.ONBOARDING}`);
    }

    return NextResponse.redirect(`${origin}${ROUTES.CALENDAR}`);
}
