import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./authHelper";

export const getAll = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    // Fetch all buyers and farmers
    const allUsers = await ctx.db.query("users").collect();
    const targetUsers = allUsers.filter(u => u.role === "buyer" || u.role === "farmer");

    const verifications = await ctx.db.query("buyerVerifications").collect();

    return targetUsers.map(u => {
      const record = verifications.find(v => v.buyerId === u._id);
      return {
        userInfo: { _id: u._id, username: u.username, email: u.email, role: u.role },
        verifiedStatus: record ? record.verifiedStatus : false,
        verificationDate: record ? record.verificationDate : null,
        _id: record ? record._id : null
      };
    });
  },
});

export const toggleStatus = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    status: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx, args.token);
    if (!admin || admin.role !== "admin") throw new Error("Unauthorized");

    let verification = await ctx.db.query("buyerVerifications")
      .withIndex("by_buyerId", (q) => q.eq("buyerId", args.userId))
      .first();

    if (verification) {
      await ctx.db.patch(verification._id, {
        verifiedStatus: args.status,
        verificationDate: args.status ? Date.now() : undefined,
        verifierId: admin._id,
      });
      return await ctx.db.get(verification._id);
    } else {
      const newId = await ctx.db.insert("buyerVerifications", {
        buyerId: args.userId,
        verifiedStatus: args.status,
        verificationDate: args.status ? Date.now() : undefined,
        verifierId: admin._id,
      });
      return await ctx.db.get(newId);
    }
  },
});
