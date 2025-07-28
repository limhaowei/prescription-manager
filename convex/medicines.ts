import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createMedicine = mutation({
  args: {
    name: v.string(),
    dosage: v.string(),
    type: v.string(),
    manufacturer: v.string(),
  },
  returns: v.id("medicines"),
  handler: async (ctx, args) => {
    const medicineId = await ctx.db.insert("medicines", {
      name: args.name,
      dosage: args.dosage,
      type: args.type,
      manufacturer: args.manufacturer,
    });
    return medicineId;
  },
});

export const listMedicines = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("medicines"),
      _creationTime: v.number(),
      name: v.string(),
      dosage: v.string(),
      type: v.string(),
      manufacturer: v.string(),
    })
  ),
  handler: async (ctx) => {
    const medicines = await ctx.db.query("medicines").collect();
    return medicines;
  },
});

export const getMedicine = query({
  args: {
    medicineId: v.id("medicines"),
  },
  returns: v.union(
    v.object({
      _id: v.id("medicines"),
      _creationTime: v.number(),
      name: v.string(),
      dosage: v.string(),
      type: v.string(),
      manufacturer: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const medicine = await ctx.db.get(args.medicineId);
    return medicine;
  },
});

export const updateMedicine = mutation({
  args: {
    medicineId: v.id("medicines"),
    name: v.optional(v.string()),
    dosage: v.optional(v.string()),
    type: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { medicineId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(medicineId, filteredUpdates);
    }
    return null;
  },
});

export const deleteMedicine = mutation({
  args: {
    medicineId: v.id("medicines"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.medicineId);
    return null;
  },
});