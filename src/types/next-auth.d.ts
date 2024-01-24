import NextAuth from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        auth: { token: string }
        user: {
            userId: number
            email: string,
            roles: string[],
            status: string,
            loginDate: Date;
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        roles: string[]
    }
}