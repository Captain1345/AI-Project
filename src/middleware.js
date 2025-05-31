import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Protect all routes under /api and any other you want
   publicRoutes: [
    "/sign-in(.*)",
    "/sign-up(.*)"
  ]
});