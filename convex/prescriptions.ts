import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createPrescription = mutation({
  args: {
    medicines: v.array(
      v.object({
        medicineId: v.id("medicines"),
        timing: v.array(v.string()),
        dosage: v.optional(v.string()),
      })
    ),
  },
  returns: v.id("prescriptions"),
  handler: async (ctx, args) => {
    const prescriptionId = await ctx.db.insert("prescriptions", {
      medicines: args.medicines,
      createdAt: Date.now(),
    });
    return prescriptionId;
  },
});

export const getPrescription = query({
  args: {
    prescriptionId: v.id("prescriptions"),
  },
  returns: v.union(
    v.object({
      _id: v.id("prescriptions"),
      _creationTime: v.number(),
      medicines: v.array(
        v.object({
          medicineId: v.id("medicines"),
          timing: v.array(v.string()),
          dosage: v.optional(v.string()),
        })
      ),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const prescription = await ctx.db.get(args.prescriptionId);
    return prescription;
  },
});

export const listPrescriptions = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("prescriptions"),
      _creationTime: v.number(),
      medicines: v.array(
        v.object({
          medicineId: v.id("medicines"),
          timing: v.array(v.string()),
          dosage: v.optional(v.string()),
        })
      ),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    return prescriptions;
  },
});

export const getPrescriptionWithMedicines = query({
  args: {
    prescriptionId: v.id("prescriptions"),
  },
  returns: v.union(
    v.object({
      _id: v.id("prescriptions"),
      _creationTime: v.number(),
      createdAt: v.number(),
      medicines: v.array(
        v.object({
          medicineId: v.id("medicines"),
          timing: v.array(v.string()),
          dosage: v.optional(v.string()),
          medicineDetails: v.union(
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
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const prescription = await ctx.db.get(args.prescriptionId);
    if (!prescription) {
      return null;
    }

    const medicinesWithDetails = await Promise.all(
      prescription.medicines.map(async (item) => {
        const medicineDetails = await ctx.db.get(item.medicineId);
        return {
          ...item,
          medicineDetails,
        };
      })
    );

    return {
      ...prescription,
      medicines: medicinesWithDetails,
    };
  },
});

export const deletePrescription = mutation({
  args: {
    prescriptionId: v.id("prescriptions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.prescriptionId);
    return null;
  },
});