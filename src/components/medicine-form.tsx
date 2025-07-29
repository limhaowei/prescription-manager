"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2, Pill } from "lucide-react";
import { motion } from "framer-motion";

const medicineSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dosage: z.string().min(1, "Dosage is required"),
  type: z.string().min(1, "Please select a medicine type"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
});

type MedicineFormValues = z.infer<typeof medicineSchema>;

const medicineTypes = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "syrup", label: "Syrup" },
  { value: "injection", label: "Injection" },
  { value: "cream", label: "Cream" },
  { value: "ointment", label: "Ointment" },
];

export function MedicineForm() {
  const createMedicine = useMutation(api.medicines.createMedicine);

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: "",
      dosage: "",
      type: "",
      manufacturer: "",
    },
  });

  async function onSubmit(data: MedicineFormValues) {
    try {
      await createMedicine(data);
      toast.success("Medicine registered successfully!");
      form.reset();
    } catch (error) {
      toast.error("Failed to register medicine. Please try again.");
    }
  }

  return (
    <>
      <CardHeader className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center"
        >
          <Pill className="w-8 h-8 text-blue-500" />
        </motion.div>
        <CardTitle className="text-2xl">Register New Medicine</CardTitle>
        <CardDescription>
          Add a new medicine to your pharmacy inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Aspirin" 
                      className="glass-button"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the commercial name of the medicine
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="500mg" 
                        className="glass-button"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Strength and unit (e.g., 500mg, 10ml)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-button">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card">
                        {medicineTypes.map((type) => (
                          <SelectItem 
                            key={type.value} 
                            value={type.value}
                            className="hover:glass-button"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Pharmaceutical Company Ltd." 
                      className="glass-button"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Name of the manufacturing company
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full text-lg shadow-lg border-2 border-primary bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 hover:shadow-xl transition-colors duration-200" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Medicine"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}