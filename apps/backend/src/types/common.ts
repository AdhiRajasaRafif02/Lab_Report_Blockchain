export type JwtPayloadUser = {
  sub: string;
  email: string;
  role: "admin" | "lab_staff" | "verifier" | "user";
};
