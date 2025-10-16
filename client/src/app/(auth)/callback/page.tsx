"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loading } from "@/components/ui/loading";
import { trackEvent } from "@/lib/analytics/tracker";
import { AUTH_EVENTS } from "@/lib/analytics/events";

export default function CallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session) {
      const oauthIntentRaw = localStorage.getItem('oauth_intent');

      if (oauthIntentRaw) {
        try {
          const oauthIntent = JSON.parse(oauthIntentRaw);
          const { provider, source_page } = oauthIntent;

          if (source_page === 'signup') {
            trackEvent(AUTH_EVENTS.SIGNUP_COMPLETED, {
              method: provider || "google",
            });
          } else if (source_page === 'login') {
            trackEvent(AUTH_EVENTS.LOGIN_COMPLETED, {
              method: provider || "google",
            });
          }
        } catch (err) {
          console.error("Failed to parse oauth_intent:", err);
        } finally {
          localStorage.removeItem('oauth_intent');
        }
      }

      router.replace("/dashboard");
    } else if (status === "unauthenticated") {
      localStorage.removeItem('oauth_intent');
      router.replace("/login?message=oauth-error");
    }
  }, [status, session, router]);

  return <Loading loadingText="Processing authentication..." />;
}
