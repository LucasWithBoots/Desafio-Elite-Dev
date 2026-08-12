import type { UserRole } from "@/entities/user/model";

export interface LoginFormValues {
  email: string;
  password: string;
  expectedRole?: UserRole;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}
