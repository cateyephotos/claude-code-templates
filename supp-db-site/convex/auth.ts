import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

/**
 * Server-side auth helpers for Convex functions.
 * All functions that access user data or admin features use these guards.
 */

export type UserRole = "admin" | "subscriber" | "free";

export interface AuthUser {
  _id: any;
  clerkId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: number;
  lastLoginAt: number;
}

/**
 * Get the authenticated user from the Convex auth context.
 * Returns null if not authenticated or user not found in DB.
 */
export async function getAuthUser(
  ctx: QueryCtx | MutationCtx
): Promise<AuthUser | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  // Clerk subject is the clerkId
  const clerkId = identity.subject;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();

  return user as AuthUser | null;
}

/**
 * Require authentication — throws if not signed in.
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<AuthUser> {
  const user = await getAuthUser(ctx);
  if (!user) {
    throw new Error("Authentication required. Please sign in.");
  }
  return user;
}

/**
 * Require a specific role — throws if user doesn't have it.
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  requiredRole: UserRole
): Promise<AuthUser> {
  const user = await requireAuth(ctx);

  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    subscriber: 2,
    free: 1,
  };

  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw new Error(
      `Insufficient permissions. Required: ${requiredRole}, Current: ${user.role}`
    );
  }

  return user;
}

/**
 * Require admin role — shorthand for requireRole(ctx, "admin").
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<AuthUser> {
  return requireRole(ctx, "admin");
}

/**
 * Check if the current user has at least subscriber access (admin or subscriber).
 */
export async function requireSubscriber(
  ctx: QueryCtx | MutationCtx
): Promise<AuthUser> {
  return requireRole(ctx, "subscriber");
}

/**
 * Get the Clerk identity without requiring a DB user record.
 * Useful for webhook handlers and initial user creation.
 */
export async function getIdentity(ctx: QueryCtx | MutationCtx) {
  return ctx.auth.getUserIdentity();
}
