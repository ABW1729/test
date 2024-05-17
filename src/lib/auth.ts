
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {

  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      httpOptions:{
        timeout:10000,
      }
      
    }),
   
    CredentialsProvider({
      name: "Sign in",
      id: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
     
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const res = await fetch("https://axis-3.vercel.app/api/getSignIn", {
          method: "GET",
          headers: {
            "Content-Type": "application/json", 
            "email":credentials.email
          },
       
        });
      
        const data= await res.json();
        const user=data.user;
        if (!user || !(await compare(credentials.password, user.password!))) {
          return null;
        }
     

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          randomKey: "AfClbtmT0Z2zJBq8CWNZzVG7PSNoX11wsm6n3vmkmMs=",
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
        };
      }
      return token;
    },
  },
  secret:"gu3sEHKxWS7bBjJQvl0sTIEc8t/jS2YzKshfSsIQ1Xg=",
};
