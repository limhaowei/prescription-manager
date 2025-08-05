import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  medicines: defineTable({
    name: v.string(),
    dosage: v.string(),
    type: v.string(),
    manufacturer: v.string(),
  }),

  prescriptions: defineTable({
    medicines: v.array(
      v.object({
        medicineId: v.id("medicines"),
        timing: v.array(v.string()),
        dosage: v.optional(v.string()), // Keep for backward compatibility
        instruction: v.optional(v.string()), // New field
        meal: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
});