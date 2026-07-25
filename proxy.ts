import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Request gate for the whole app.
 *
 * Next 16 renamed the `middleware` file convention to `proxy`; the export is
 * still a single default function and `config.matcher` is unchanged. The
 * Clerk helper keeps its own name — only the file convention moved, and
 * @clerk/nextjs recognises `proxy` on Next 16+.
 *
 * Public routes: marketing/auth pages. Everything else requires a session.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  // `auth.protect()` renders a 404 for signed-out visitors, which makes a
  // shared link like /post/<id> look broken. Redirect to sign-in instead and
  // send them back to the link once they're in. The route is equally protected
  // either way — this only changes what a logged-out visitor is shown.
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
    "/(api|trpc)(.*)",
  ],
};
