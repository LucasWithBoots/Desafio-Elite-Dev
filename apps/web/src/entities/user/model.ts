export type UserRole = "organizer" | "customer" | "gate";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
