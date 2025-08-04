// import { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';
// import bcrypt from 'bcryptjs';
// import connectToDatabase from './mongodb';
// import User from '@/models/User';

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         await connectToDatabase();
//         const user = await User.findOne({ email: credentials.email });

//         if (!user || !user.password) {
//           return null;
//         }

//         const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

//         if (!isPasswordValid) {
//           return null;
//         }

//         return {
//           id: user._id.toString(),
//           email: user.email,
//           name: user.name,
//           role: user.role,
//         };
//       }
//     })
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = (user as any).role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.sub!;
//         (session.user as any).role = token.role;
//       }
//       return session;
//     }
//   },
//   pages: {
//     signIn: '/login',
//   },
//   session: {
//     strategy: 'jwt',
//   },
// };




// import { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import dbConnect from './mongodb';
// import User from '@/models/User';

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         await dbConnect();
        
//         const user = await User.findOne({ email: credentials.email });
        
//         if (!user) {
//           return null;
//         }

//         const isPasswordValid = await user.comparePassword(credentials.password);
        
//         if (!isPasswordValid) {
//           return null;
//         }

//         return {
//           id: user._id.toString(),
//           email: user.email,
//           name: user.name,
//           role: user.role,
//         };
//       }
//     })
//   ],
//   session: {
//     strategy: 'jwt',
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.sub!;
//         session.user.role = token.role as string;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: '/auth/login',
//   }
// };



import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './mongodb';
import User from '@/models/User';

// Type augmentation for NextAuth custom fields
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    sub?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          return null;
        }

        const isPasswordValid = await user.comparePassword(credentials.password);
        
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Guard: session.user may be undefined
      if (!session.user) session.user = {} as any;
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  }
};