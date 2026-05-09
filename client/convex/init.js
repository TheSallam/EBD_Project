"use node";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const addAdmin = action({
  args: {},
  handler: async (ctx) => {
    try {
      await ctx.runAction(api.auth.register, {
        username: "superadmin",
        email: "admin@agriflow.com",
        password: "password123",
        role: "admin",
      });
      return "✅ Admin created successfully: admin@agriflow.com / password123";
    } catch (e) {
      return "⚠️ Admin might already exist: " + e.message;
    }
  }
});
