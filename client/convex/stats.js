import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").filter(q => q.eq(q.field("isAvailable"), true)).collect();
    const activeListings = products.length;

    const verifications = await ctx.db.query("buyerVerifications").filter(q => q.eq(q.field("verifiedStatus"), true)).collect();
    const verifiedBuyers = verifications.length;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const allTransactions = await ctx.db.query("transactions").collect();
    
    const recentTransactions = allTransactions.filter(tx => tx.transactionDate > sevenDaysAgo).length;
    
    const totalRevenue = allTransactions.reduce((acc, tx) => acc + (tx.totalPrice || 0), 0);

    return { activeListings, verifiedBuyers, recentTransactions, totalRevenue };
  }
});
