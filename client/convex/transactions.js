import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./authHelper";

export const getTransactions = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return [];

    let transactions = [];

    if (user.role === "farmer") {
      // Find products owned by farmer
      const myProducts = await ctx.db.query("products")
        .withIndex("by_farmerId", (q) => q.eq("farmerId", user._id))
        .collect();
      const productIds = new Set(myProducts.map(p => p._id));

      const allTxs = await ctx.db.query("transactions").collect();
      transactions = allTxs.filter(tx => productIds.has(tx.productId));
    } else if (user.role === "buyer") {
      transactions = await ctx.db.query("transactions")
        .withIndex("by_buyerId", (q) => q.eq("buyerId", user._id))
        .collect();
    } else if (user.role === "admin") {
      transactions = await ctx.db.query("transactions").collect();
    }

    // Sort by date desc
    transactions.sort((a, b) => b.transactionDate - a.transactionDate);

    // Populate data
    return await Promise.all(
      transactions.map(async (tx) => {
        const buyer = await ctx.db.get(tx.buyerId);
        let product = null;
        let farmer = null;
        
        try {
          product = await ctx.db.get(tx.productId);
          if (product) {
            farmer = await ctx.db.get(product.farmerId);
          }
        } catch (e) {
          // product might be deleted
        }

        return {
          ...tx,
          buyerId: buyer ? { _id: buyer._id, username: buyer.username, email: buyer.email } : null,
          productId: product ? {
            _id: product._id,
            productName: product.productName,
            pricePerUnit: product.pricePerUnit,
            farmerId: farmer ? { _id: farmer._id, username: farmer.username } : null
          } : {
            _id: tx.productId,
            productName: tx.productNameSnapshot,
            pricePerUnit: tx.priceSnapshot,
            farmerId: null
          }
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    productId: v.id("products"),
    quantityPurchased: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "buyer") throw new Error("Unauthorized");

    const qty = args.quantityPurchased;
    if (qty <= 0) throw new Error("Quantity must be positive");

    const verification = await ctx.db.query("buyerVerifications")
      .withIndex("by_buyerId", (q) => q.eq("buyerId", user._id))
      .first();
      
    if (!verification || !verification.verifiedStatus) {
      throw new Error("Account not verified. You cannot make purchases until approved by an Admin.");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || !product.isAvailable) {
      throw new Error("Product not found or unavailable");
    }

    if (product.quantity < qty) {
      throw new Error(`Not enough stock. Only ${product.quantity} available.`);
    }

    // Update product stock
    const newQty = product.quantity - qty;
    await ctx.db.patch(product._id, {
      quantity: newQty,
      isAvailable: newQty > 0
    });

    const totalPrice = qty * product.pricePerUnit;

    const txId = await ctx.db.insert("transactions", {
      buyerId: user._id,
      productId: product._id,
      productNameSnapshot: product.productName,
      priceSnapshot: product.pricePerUnit,
      quantityPurchased: qty,
      totalPrice,
      status: "pending",
      transactionDate: Date.now(),
    });

    return await ctx.db.get(txId);
  },
});

export const updateStatus = mutation({
  args: {
    token: v.string(),
    id: v.id("transactions"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("delivered"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("Unauthorized");

    const tx = await ctx.db.get(args.id);
    if (!tx) throw new Error("Transaction not found");

    const product = await ctx.db.get(tx.productId);
    
    const isOwner = user.role === "farmer" && product?.farmerId === user._id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, { status: args.status });
    return await ctx.db.get(args.id);
  },
});
