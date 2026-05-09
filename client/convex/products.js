import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./authHelper";

// Get all products (Public/Buyers can see)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products")
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect();
      
    return await Promise.all(
      products.map(async (p) => {
        const farmer = await ctx.db.get(p.farmerId);
        return { ...p, farmerId: { _id: farmer._id, username: farmer.username } };
      })
    );
  },
});

// Get my products (Farmer Dashboard)
export const getMyProducts = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "farmer") return []; // Return empty if not auth'd to prevent UI crashes

    const products = await ctx.db.query("products")
      .withIndex("by_farmerId", (q) => q.eq("farmerId", user._id))
      .collect();
      
    // Sort descending by dateListed
    return products.sort((a, b) => b.dateListed - a.dateListed);
  },
});

// Create product
export const create = mutation({
  args: {
    token: v.string(),
    productName: v.string(),
    pricePerUnit: v.number(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "farmer") throw new Error("Unauthorized");

    // The original code checked buyerVerification for farmers for some reason, keeping that logic
    const verification = await ctx.db.query("buyerVerifications")
      .withIndex("by_buyerId", (q) => q.eq("buyerId", user._id))
      .first();
      
    if (!verification || !verification.verifiedStatus) {
      throw new Error("Account not verified. You cannot post listings until approved by an Admin.");
    }

    const productId = await ctx.db.insert("products", {
      farmerId: user._id,
      productName: args.productName,
      pricePerUnit: args.pricePerUnit,
      quantity: args.quantity,
      isAvailable: true,
      dateListed: Date.now(),
    });
    
    return await ctx.db.get(productId);
  },
});

// Delete product
export const remove = mutation({
  args: { token: v.string(), id: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "farmer") throw new Error("Unauthorized");

    const product = await ctx.db.get(args.id);
    if (!product || product.farmerId !== user._id) throw new Error("Product not found or unauthorized");

    await ctx.db.delete(args.id);
  },
});
