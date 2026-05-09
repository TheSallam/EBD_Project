"use node";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const register = action({
  args: {
    username: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("farmer"), v.literal("buyer"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const existingByEmail = await ctx.runQuery(internal.users.getUserByEmail, { email: args.email });
    const existingByUsername = await ctx.runQuery(internal.users.getUserByUsername, { username: args.username });

    if (existingByEmail || existingByUsername) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(args.password, 12);

    const userId = await ctx.runMutation(internal.users.createUser, {
      username: args.username,
      email: args.email,
      password: hashedPassword,
      role: args.role,
    });

    const token = crypto.randomBytes(32).toString("hex");

    await ctx.runMutation(internal.users.createSession, {
      userId,
      token,
    });

    const user = await ctx.runQuery(internal.users.getUserById, { userId });

    return {
      message: "User created successfully",
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    };
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getUserByEmail, { email: args.email });
    
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(args.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = crypto.randomBytes(32).toString("hex");

    await ctx.runMutation(internal.users.createSession, {
      userId: user._id,
      token,
    });

    return {
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    };
  },
});
