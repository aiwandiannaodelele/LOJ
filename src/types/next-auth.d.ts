import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      userGroupId: string;
      isAdmin: boolean;
    };
  }

  interface User {
    role: string;
    userGroupId: string;
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    userGroupId: string;
    isAdmin: boolean;
  }
}
