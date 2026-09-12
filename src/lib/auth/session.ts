import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { getMongoDatabase } from "@/lib/mongodb/client";
import { getCollections, type UserDocument } from "@/lib/mongodb/collections";
import type { UserRole } from "@/types/organization";

export const AUTH_COOKIE = "reserve_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserDocument["status"];
  organizationId?: string | null;
}

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(value);
}

export function publicUser(user: UserDocument): PublicUser {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone ?? null, role: user.role, status: user.status, organizationId: user.organizationId ?? null };
}

export async function createSessionToken(user: UserDocument) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user._id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function getCurrentUser(): Promise<UserDocument | null> {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    const db = await getMongoDatabase();
    if (!db) return null;
    const user = await getCollections(db).users.findOne({ _id: payload.sub });
    return user?.status === "ACTIVE" ? user : null;
  } catch {
    return null;
  }
}

export async function requireUser(roles?: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required.", status: 401 as const };
  if (roles && !roles.includes(user.role)) return { error: "You do not have permission for this action.", status: 403 as const };
  return { user };
}
