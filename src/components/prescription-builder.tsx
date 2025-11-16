"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  X, 
  Check, 
  ChevronsUpDown,
  Sun,
  Sunset,
  Moon,
  Download,
  Loader2
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

type PrescriptionMedicine = {
  medicineId: Id<"medicines">;
  medicineName?: string;
  medicineType?: string;
  medicineDosage?: string;
  timing: string[];
  dosage?: string; // Keep for backward compatibility
  instruction?: string;
  meal?: string; 
};

const timingOptions = [
  { value: "morning", label: "Morning", icon: Sun },
  { value: "afternoon", label: "Afternoon", icon: Sunset },
  { value: "night", label: "Night", icon: Moon },
];

export function PrescriptionBuilder() {
  const medicines = useQuery(api.medicines.listMedicines);
  const createPrescription = useMutation(api.prescriptions.createPrescription);
  
  const [selectedMedicines, setSelectedMedicines] = useState<PrescriptionMedicine[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const addMedicine = (medicineId: Id<"medicines">) => {
    const medicine = medicines?.find(m => m._id === medicineId);
    if (medicine && !selectedMedicines.find(m => m.medicineId === medicineId)) {
      setSelectedMedicines([
        ...selectedMedicines,
        {
          medicineId,
          medicineName: medicine.name,
          medicineType: medicine.type,
          medicineDosage: medicine.dosage,
          timing: ["morning"],
          instruction: "",
          meal: undefined,
        },
      ]);
      setSearchValue("");
      setSearchOpen(false);
    }
  };

  const removeMedicine = (medicineId: Id<"medicines">) => {
    setSelectedMedicines(selectedMedicines.filter(m => m.medicineId !== medicineId));
  };

  const updateTiming = (medicineId: Id<"medicines">, timing: string[]) => {
    setSelectedMedicines(
      selectedMedicines.map(m =>
        m.medicineId === medicineId ? { ...m, timing } : m
      )
    );
  };

  const updateInstruction = (medicineId: Id<"medicines">, instruction: string) => {
    setSelectedMedicines(
      selectedMedicines.map(m =>
        m.medicineId === medicineId ? { ...m, instruction } : m
      )
    );
  };

  const updateMeal = (medicineId: Id<"medicines">, meal: string) => {
    setSelectedMedicines(
      selectedMedicines.map(m =>
        m.medicineId === medicineId ? { ...m, meal } : m
      )
    );
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Color scheme for elderly-friendly design
    const colors = {
      header: [59, 130, 246], // Blue
      morning: [255, 193, 7], // Yellow/Orange
      afternoon: [255, 152, 0], // Orange
      night: [63, 81, 181], // Indigo
      meal: [76, 175, 80], // Green
      text: [33, 33, 33], // Dark gray
      lightGray: [245, 245, 245],
      border: [200, 200, 200],
    };
    
    // Header with larger, friendly text
    doc.setFontSize(28);
    doc.setTextColor(colors.header[0], colors.header[1], colors.header[2]);
    doc.setFont(undefined, "bold");
    doc.text("Medical Prescription", pageWidth / 2, 25, { align: "center" });
    
    // Date
    doc.setFontSize(14);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont(undefined, "normal");
    const dateText = `Date: ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
    doc.text(dateText, 20, 45);
    
    let yPos = 65;
    
    // Group medicines by timing
    const medicinesByTiming = selectedMedicines.reduce((acc, med) => {
      med.timing.forEach(time => {
        if (!acc[time]) acc[time] = [];
        acc[time].push(med);
      });
      return acc;
    }, {} as Record<string, PrescriptionMedicine[]>);
    
    // Render by timing with visual boxes
    timingOptions.forEach(({ value, label }) => {
      const medsAtTime = medicinesByTiming[value];
      if (medsAtTime && medsAtTime.length > 0) {
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }
        
        // Section background box
        const boxHeight = 15 + (medsAtTime.length * 25) + 10;
        const sectionColor = value === 'morning' ? colors.morning :
                           value === 'afternoon' ? colors.afternoon : colors.night;
        
        // Light background for section
        doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
        doc.roundedRect(15, yPos - 5, pageWidth - 30, boxHeight, 3, 3, 'F');
        
        // Colored border
        doc.setDrawColor(sectionColor[0], sectionColor[1], sectionColor[2]);
        doc.setLineWidth(2);
        doc.roundedRect(15, yPos - 5, pageWidth - 30, boxHeight, 3, 3, 'D');
        
        // Section header
        doc.setFontSize(18);
        doc.setFont(undefined, "bold");
        doc.setTextColor(sectionColor[0], sectionColor[1], sectionColor[2]);
        doc.text(`${label.toUpperCase()}`, 25, yPos + 8);
        
        yPos += 20;
        
        // Medicines in this section
        doc.setFont(undefined, "normal");
        doc.setFontSize(14); // Larger font for medicine names
        
        medsAtTime.forEach((med, index) => {
          // Medicine name (bold, larger)
          doc.setFont(undefined, "bold");
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          doc.text(med.medicineName, 30, yPos);
          yPos += 10;
          
          // Instruction/dosage
          doc.setFont(undefined, "normal");
          doc.setFontSize(12);
          const instructionText = med.instruction || med.dosage || med.medicineDosage || "As directed";
          doc.setTextColor(80, 80, 80);
          doc.text(`   Dosage: ${instructionText}`, 30, yPos);
          yPos += 8;
          
          // Meal timing if specified
          if (med.meal) {
            doc.setFontSize(11);
            doc.setTextColor(colors.meal[0], colors.meal[1], colors.meal[2]);
            const mealText = med.meal === 'before' ? "BEFORE MEAL" : "AFTER MEAL";
            doc.text(`   ${mealText}`, 30, yPos);
            yPos += 8;
          }
          
          // Spacing between medicines
          yPos += 5;
        });
        
        yPos += 10; // Extra spacing after section
      }
    });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by Prescription Manager", pageWidth / 2, pageHeight - 10, { align: "center" });
    
    // Save the PDF
    doc.save("prescription.pdf");
    toast.success("PDF downloaded successfully!");
  };

  const handleCreate = async () => {
    if (selectedMedicines.length === 0) {
      toast.error("Please add at least one medicine");
      return;
    }

    setIsCreating(true);
    try {
      const prescriptionData = selectedMedicines.map(med => ({
        medicineId: med.medicineId,
        timing: med.timing,
        instruction: med.instruction,
        meal: med.meal,
      }));

      await createPrescription({ medicines: prescriptionData });
      
      // Generate PDF after successful creation
      generatePDF();
      
      toast.success("Prescription created successfully!");
      setSelectedMedicines([]);
    } catch (error) {
      toast.error("Failed to create prescription");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <CardHeader className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center"
        >
          <FileText className="w-8 h-8 text-purple-500" />
        </motion.div>
        <CardTitle className="text-2xl">Create Prescription</CardTitle>
        <CardDescription>
          Build a prescription by selecting medicines and their instruction timing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Medicine Selector */}
        <div className="space-y-2">
          <Label>Add Medicine</Label>
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={searchOpen}
                className="w-full justify-between glass-button"
              >
                <span className="truncate">
                  {searchValue || "Select medicine..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 glass-card">
              <Command>
                <CommandInput placeholder="Search medicine..." />
                <CommandEmpty>No medicine found.</CommandEmpty>
                <ScrollArea className="h-72">
                  <CommandGroup>
                    {medicines?.map((medicine) => (
                      <CommandItem
                        key={medicine._id}
                        value={medicine.name}
                        onSelect={() => addMedicine(medicine._id)}
                        className="hover:glass-button"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedMedicines.find(m => m.medicineId === medicine._id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{medicine.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {medicine.dosage} • {medicine.type}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Medicines */}
        <div className="space-y-4">
          <Label>Selected Medicines</Label>
          <AnimatePresence>
            {selectedMedicines.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 glass rounded-lg"
              >
                <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No medicines added yet
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {selectedMedicines.map((medicine, index) => (
                  <motion.div
                    key={medicine.medicineId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{medicine.medicineName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {medicine.medicineDosage} • {medicine.medicineType}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMedicine(medicine.medicineId)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Custom Instruction */}
                    <div className="space-y-2">
                      <Label className="text-sm">Instructions (optional)</Label>
                      <Input
                        placeholder="e.g., 1 tablet, 5ml, after meals"
                        value={medicine.instruction}
                        onChange={(e) => updateInstruction(medicine.medicineId, e.target.value)}
                        className="glass-button h-9"
                      />
                    </div>

                    {/* Timing Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm">When to take</Label>
                      <div className="flex flex-wrap gap-2">
                        {timingOptions.map(({ value, label, icon: Icon }) => {
                          const isSelected = medicine.timing.includes(value);
                          return (
                            <label
                              key={value}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
                                isSelected
                                  ? "glass-button bg-primary/10"
                                  : "glass hover:glass-button"
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateTiming(medicine.medicineId, [...medicine.timing, value]);
                                  } else {
                                    const newTiming = medicine.timing.filter(t => t !== value);
                                    if (newTiming.length > 0) {
                                      updateTiming(medicine.medicineId, newTiming);
                                    }
                                  }
                                }}
                                className="data-[state=checked]:bg-primary"
                              />
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    {/* Meal Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm">Meal Instruction</Label>
                      <div className="flex gap-2">
                        <label className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
                          medicine.meal === "before"
                            ? "glass-button bg-primary/10"
                            : "glass hover:glass-button"
                        )}>
                          <input
                            type="radio"
                            name={`meal-${medicine.medicineId}`}
                            checked={medicine.meal === "before"}
                            onChange={() => updateMeal(medicine.medicineId, "before")}
                            className="accent-primary"
                          />
                          <span className="text-sm">Before Meal</span>
                        </label>
                        <label className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
                          medicine.meal === "after"
                            ? "glass-button bg-primary/10"
                            : "glass hover:glass-button"
                        )}>
                          <input
                            type="radio"
                            name={`meal-${medicine.medicineId}`}
                            checked={medicine.meal === "after"}
                            onChange={() => updateMeal(medicine.medicineId, "after")}
                            className="accent-primary"
                          />
                          <span className="text-sm">After Meal</span>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleCreate}
            disabled={selectedMedicines.length === 0 || isCreating}
            className="flex-1 text-lg shadow-lg border-2 border-primary bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 hover:shadow-xl transition-colors duration-200"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Create & Download PDF
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </>
  );
}