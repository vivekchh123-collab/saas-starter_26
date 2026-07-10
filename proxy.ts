import { clerkMiddleware, createRouteMatcher,clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/api/webhook/register",
  "/sign-in(.*)",
  "/sign-up(.*)",
];
const isPublicRoute = createRouteMatcher(publicRoutes);

const adminRoutes = createRouteMatcher(["/admin(.*)"]);
const dashboardRoute = createRouteMatcher(["/dashboard"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;

  //handle unauthenticated usersnto access protected routes

  if (!userId) {
    if (!isPublicRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    return NextResponse.next();
  }

  //handle authenticated users trying to access public routes
  if (role === "admin" && dashboardRoute(req)) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  //prevent non-admin users from accessing admin routes

  if (role !== "admin" && adminRoutes(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  //redirect authenticated users to their respective dashboards if they try to access public routes
  if (isPublicRoute(req)) {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url),
    );
  }

  return NextResponse.next();
});

export const config = {

  //Skip middleware for static files and API routes, and apply it to all other routes
  matcher: ["/((?!.*\\.[\\w]+$|_next).*)", 
    "/", 
    //Always runn  for API routes to ensure proper authentication and authorization
    "/(api|trpc)(.*)"],
};
