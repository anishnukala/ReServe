import type { UserDocument } from "@/lib/mongodb/collections";
export function donationScope(user: UserDocument): Record<string, unknown> { if (user.role === "restaurant") return { donorUserId: user._id }; if (user.role === "food_org") return { selectedOrganizationId: user.organizationId || "__none__" }; return {}; }
export function rescueScope(user: UserDocument): Record<string, unknown> { if (user.role === "restaurant") return { donorUserId: user._id }; if (user.role === "food_org") return { recipientOrgId: user.organizationId || "__none__" }; return {}; }
