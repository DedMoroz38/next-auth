declare module "next-auth" {
  interface Session {
    user: {
      role: string;
    } & DefaultSession["user"],
    accessToken: string
    refreshToken: string
    refreshExpiresIn: number
    accessExpiresIn: number
  }

  interface User {
    accessToken: string;
    refreshToken: string;
  }
}
//
// declare module "next-auth/jwt" {
//   interface JWT {
//     accessToken: string;
//     refreshToken: string;
//   }
// }
