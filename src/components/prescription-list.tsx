"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  Calendar,
  Sun,
  Sunset,
  Moon,
  Trash2,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import jsPDF from "jspdf";
import { format } from "date-fns";

const timingIcons = {
  morning: Sun,
  afternoon: Sunset,
  night: Moon,
};

type PrescriptionWithMedicines = {
  _id: Id<"prescriptions">;
  _creationTime: number;
  createdAt: number;
  medicines: Array<{
    medicineId: Id<"medicines">;
    timing: string[];
    dosage?: string; // Keep for backward compatibility
    instruction?: string;
    meal?: string; // 'before' | 'after' | undefined
    medicineDetails: {
      _id: Id<"medicines">;
      _creationTime: number;
      name: string;
      dosage: string;
      type: string;
      manufacturer: string;
    } | null;
  }>;
};

export function PrescriptionList() {
  const prescriptions = useQuery(api.prescriptions.listPrescriptions);
  const deletePrescription = useMutation(api.prescriptions.deletePrescription);
  const [prescriptionDetails, setPrescriptionDetails] = useState<Map<Id<"prescriptions">, PrescriptionWithMedicines>>(new Map());

  // Fetch detailed prescription data for each prescription
  useEffect(() => {
    async function fetchDetails() {
      if (!prescriptions) return;
      
      const details = new Map<Id<"prescriptions">, PrescriptionWithMedicines>();
      
      for (const prescription of prescriptions) {
        // Use the existing getPrescriptionWithMedicines query
        // Since we can't use hooks conditionally, we'll need to handle this differently
        // For now, we'll display basic info without medicine details
        details.set(prescription._id, {
          ...prescription,
          medicines: prescription.medicines.map(med => ({
            ...med,
            medicineDetails: null
          }))
        });
      }
      
      setPrescriptionDetails(details);
    }
    
    fetchDetails();
  }, [prescriptions]);

  const handleDelete = async (prescriptionId: Id<"prescriptions">) => {
    try {
      await deletePrescription({ prescriptionId });
      toast.success("Prescription deleted successfully");
    } catch (error) {
      toast.error("Failed to delete prescription");
    }
  };

  const generatePDF = (prescription: PrescriptionWithMedicines) => {
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
    const dateText = `Date: ${format(new Date(prescription.createdAt), "EEEE, MMMM d, yyyy")}`;
    doc.text(dateText, 20, 45);
    
    // Prescription ID (smaller, less prominent)
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`ID: ${prescription._id.slice(-8)}`, 20, 52);
    
    let yPos = 65;
    
    // Group by timing
    const medicinesByTiming: Record<string, typeof prescription.medicines> = {};
    prescription.medicines.forEach(med => {
      med.timing.forEach(time => {
        if (!medicinesByTiming[time]) medicinesByTiming[time] = [];
        medicinesByTiming[time].push(med);
      });
    });
    
    // Render by timing with visual boxes
    ["morning", "afternoon", "night"].forEach(time => {
      const meds = medicinesByTiming[time];
      if (meds && meds.length > 0) {
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }
        
        // Section background box
        const boxHeight = 15 + (meds.length * 30) + 10;
        const sectionColor = time === 'morning' ? colors.morning :
                           time === 'afternoon' ? colors.afternoon : colors.night;
        const label = time.charAt(0).toUpperCase() + time.slice(1);
        
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
        
        meds.forEach((med) => {
          const medName = med.medicineDetails?.name || "Unknown Medicine";
          
          // Medicine name (bold, larger)
          doc.setFont(undefined, "bold");
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          doc.text(medName, 30, yPos);
          yPos += 10;
          
          // Instruction/dosage
          doc.setFont(undefined, "normal");
          doc.setFontSize(12);
          const instruction = med.instruction || med.dosage || med.medicineDetails?.dosage || "As directed";
          doc.setTextColor(80, 80, 80);
          doc.text(`   Dosage: ${instruction}`, 30, yPos);
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
    
    doc.save(`prescription-${prescription._id.slice(-8)}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  if (!prescriptions) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass-card border-0">
            <CardHeader>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 mb-4 glass rounded-full flex items-center justify-center">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-xl font-semibold mb-2">No prescriptions yet</p>
          <p className="text-muted-foreground text-center">
            Create your first prescription in the Create tab
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription, index) => {
        const details = prescriptionDetails.get(prescription._id) || prescription;
        
        return (
          <motion.div
            key={prescription._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-card border-0 hover:glass transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(prescription.createdAt), "PPP")}</span>
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(prescription.createdAt), "p")}</span>
                    </div>
                    <h3 className="text-lg font-semibold">
                      Prescription #{prescription._id.slice(-8)}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePDF(details as PrescriptionWithMedicines)}
                      className="glass-button"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(prescription._id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {prescription.medicines.length} medicine{prescription.medicines.length !== 1 ? 's' : ''} prescribed
                  </p>
                  
                  {/* Group medicines by timing */}
                  {["morning", "afternoon", "night"].map(time => {
                    const medsAtTime = prescription.medicines.filter(m => m.timing.includes(time));
                    const Icon = timingIcons[time as keyof typeof timingIcons];
                    
                    if (medsAtTime.length === 0) return null;
                    
                    return (
                      <div key={time} className="flex items-start gap-3">
                        <div className="w-8 h-8 glass rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1 capitalize">{time}</p>
                          <div className="flex flex-wrap gap-2">
                            {medsAtTime.map((med, idx) => (
                              <Badge 
                                key={`${med.medicineId}-${idx}`} 
                                variant="secondary"
                                className="glass-button text-xs"
                              >
                                {med.instruction || med.dosage || "Standard dose"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}