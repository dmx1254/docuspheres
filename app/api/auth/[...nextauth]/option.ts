import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/app/models/User";
import { LoginHistory } from "@/app/models/LoginHistory";
import bcrypt from "bcrypt";
import { UAParser } from "ua-parser-js";
import { LoginUserInfo } from "@/app/types";

import { connectDB } from "@/lib/mongodb";

connectDB();

export const options: NextAuthOptions = {
  pages: {
    signIn: "/login",
    signOut: "/login",
    newUser: "/register",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Informations d'identification invalides");
        }

        const user = await User.findOne({ email: credentials.email });
        const userAgent = req.headers && req.headers["user-agent"];

        // Préparer les informations de connexion
        const clientIp = req.headers && req.headers["x-forwarded-for"];
        const loginInfo: LoginUserInfo = {
          email: credentials.email,
          ip: clientIp || "unknown",
          userAgent: userAgent || "unknown",
          success: false,
        };

        // Parser le User-Agent
        const ua = new UAParser(loginInfo.userAgent);
        const browser = ua.getBrowser();
        const os = ua.getOS();
        const device = ua.getDevice();

        // Enrichir les informations de connexion
        loginInfo.browser = `${browser.name} ${browser.version}`;
        loginInfo.os = `${os.name} ${os.version}`;
        loginInfo.device = device.type || "desktop";

        // Obtenir la localisation à partir de l'IP (simulation ici)
        // loginInfo.country = "FR";
        // loginInfo.city = "Paris";

        if (!user || !user.password) {
          loginInfo.failureReason = "Utilisateur non trouvé";
          await LoginHistory.create(loginInfo);
          throw new Error("Utilisateur non trouvé");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          loginInfo.failureReason = "Mot de passe incorrect";
          await LoginHistory.create(loginInfo);
          throw new Error("Mot de passe incorrect");
        }

        // Enregistrer la connexion réussie
        loginInfo.success = true;
        loginInfo.userId = user._id;
        await LoginHistory.create(loginInfo);

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Si l'URL est relative, la préfixer avec baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Si l'URL est déjà absolue, la retourner telle quelle
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
};
