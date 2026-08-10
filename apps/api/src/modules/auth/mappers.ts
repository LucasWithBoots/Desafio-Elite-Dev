import type { User } from "@prisma/client";

const roleMap = {
  ORGANIZER: "organizer",
  CUSTOMER: "customer",
  GATE: "gate",
} as const;

export function toUserDto(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleMap[user.role],
  };
}
