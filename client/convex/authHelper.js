export async function getAuthenticatedUser(ctx, token) {
  if (!token) return null;
  
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();
    
  if (!session || session.expiresAt < Date.now()) return null;
  
  return await ctx.db.get(session.userId);
}
