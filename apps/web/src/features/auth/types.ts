import type { UserRole } from "@/entities/user/model";

export interface LoginFormValues {
  email: string;
  password: string;
  expectedRole?: UserRole;
}
