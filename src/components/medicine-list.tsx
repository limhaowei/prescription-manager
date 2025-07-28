"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Pill, Trash2, Package, TestTube } from "lucide-react";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

const medicineTypeIcons = {
  tablet: <Pill className="w-4 h-4" />,
  capsule: <Package className="w-4 h-4" />,
  syrup: <TestTube className="w-4 h-4" />,
  injection: <TestTube className="w-4 h-4" />,
  cream: <Package className="w-4 h-4" />,
  ointment: <Package className="w-4 h-4" />,
};

export function MedicineList() {
  const medicines = useQuery(api.medicines.listMedicines);
  const deleteMedicine = useMutation(api.medicines.deleteMedicine);
  const [deleteId, setDeleteId] = useState<Id<"medicines"> | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteMedicine({ medicineId: deleteId });
      toast.success("Medicine deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete medicine");
    }
  };

  if (!medicines) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card border-0">
            <CardHeader>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 mb-4 glass rounded-full flex items-center justify-center">
            <Pill className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-xl font-semibold mb-2">No medicines registered</p>
          <p className="text-muted-foreground text-center">
            Start by registering your first medicine in the Register tab
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {medicines.map((medicine, index) => (
          <motion.div
            key={medicine._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-card border-0 hover:glass transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 glass rounded-lg flex items-center justify-center">
                      {medicineTypeIcons[medicine.type as keyof typeof medicineTypeIcons] || <Pill className="w-4 h-4" />}
                    </div>
                    <Badge variant="secondary" className="glass-button">
                      {medicine.type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteId(medicine._id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <CardTitle className="text-lg mt-3">{medicine.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Dosage:</span>
                    <span className="font-medium">{medicine.dosage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <span className="font-medium text-right max-w-[150px] truncate">
                      {medicine.manufacturer}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medicine? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}