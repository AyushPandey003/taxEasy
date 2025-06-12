import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import NeonAdapter from "@auth/neon-adapter"
import { Pool } from "@neondatabase/serverless"

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id: string;
      admin: boolean; 
    };
  }
  interface User {
    id: string;
    admin: boolean;
  }
}
 
export const { handlers, auth, signIn, signOut } = NextAuth(() => {

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return {
    adapter: NeonAdapter(pool),
    providers: [Google
      ({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        allowDangerousEmailAccountLinking: true,
      })
    ],
    callbacks: {
      async session({ session, user }) {
        // Add custom fields to the session
        if (session.user) {
          session.user.id = user.id;
          session.user.admin = user.admin;
        }
        return session;
      },
    },
  }
})