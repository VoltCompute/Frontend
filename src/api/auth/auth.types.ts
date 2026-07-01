/** Miroir de `RegisterRequest` (backend/app/schemas/auth.py). */
export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

/** Miroir de `LoginRequest` (backend/app/schemas/auth.py). */
export type LoginPayload = {
  email: string;
  password: string;
};

/** Miroir de `UserResponse` (backend/app/schemas/auth.py). */
export type AuthUser = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  balance_sats: number;
};

/** Miroir de `LoginResponse` (backend/app/schemas/auth.py). */
export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};
