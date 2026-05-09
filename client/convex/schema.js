import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("farmer"), v.literal("buyer"), v.literal("admin")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  sessions: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  products: defineTable({
    farmerId: v.id("users"),
    productName: v.string(),
    quantity: v.number(),
    pricePerUnit: v.number(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")), // Image support
    isAvailable: v.boolean(),
    dateListed: v.number(),
  })
    .index("by_farmerId", ["farmerId"])
    .searchIndex("search_name", { searchField: "productName" }), // Server-side search

  buyerVerifications: defineTable({
    buyerId: v.id("users"),
    verifiedStatus: v.boolean(),
    verificationDate: v.optional(v.number()),
    verifierId: v.optional(v.id("users")),
  }).index("by_buyerId", ["buyerId"]),

  transactions: defineTable({
    buyerId: v.id("users"),
    productId: v.id("products"),
    productNameSnapshot: v.string(),
    priceSnapshot: v.number(),
    quantityPurchased: v.number(),
    totalPrice: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    transactionDate: v.number(),
  })
    .index("by_buyerId", ["buyerId"])
    .index("by_productId", ["productId"]),
});
