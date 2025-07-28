"use client";

import { AnimatedNavFramer } from "@/components/ui/navigation-bar-animation";
import { Footer } from "@/components/ui/footer";
import { BGPattern } from "@/components/ui/bg-pattern";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pill, FileText, Plus, List } from "lucide-react";
import { MedicineForm } from "@/components/medicine-form";
import { MedicineList } from "@/components/medicine-list";
import { PrescriptionBuilder } from "@/components/prescription-builder";
import { PrescriptionList } from "@/components/prescription-list";

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center">
      {/* Background pattern */}
      <BGPattern
        variant="grid"
        mask="fade-edges"
        size={40}
        fill={
          theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"
        }
        className="fixed inset-0"
      />
      
      <AnimatedNavFramer />
      
      {/* Hero Section with Glass Effect */}
      <section className="relative w-full py-20 px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center"
        >
          <div className="glass-card rounded-3xl p-12 mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4 relative z-10">
              Medicine Manager
            </h1>
            <p className="text-xl text-muted-foreground relative z-10">
              Streamline your pharmacy operations with our modern prescription management system
            </p>
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto px-4 pb-20">
        <Tabs defaultValue="medicines" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 glass rounded-xl h-14 p-1 mb-8">
            <TabsTrigger 
              value="medicines" 
              className="data-[state=active]:glass-card rounded-lg flex items-center gap-2 text-base"
            >
              <Pill className="w-4 h-4" />
              Medicines
            </TabsTrigger>
            <TabsTrigger 
              value="prescriptions"
              className="data-[state=active]:glass-card rounded-lg flex items-center gap-2 text-base"
            >
              <FileText className="w-4 h-4" />
              Prescriptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medicines" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Tabs defaultValue="register" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 glass rounded-lg h-12 p-1 mb-6">
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:glass-button rounded-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Register
                  </TabsTrigger>
                  <TabsTrigger 
                    value="browse"
                    className="data-[state=active]:glass-button rounded-md flex items-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    Browse
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="register">
                  <Card className="glass-card border-0">
                    <MedicineForm />
                  </Card>
                </TabsContent>

                <TabsContent value="browse">
                  <MedicineList />
                </TabsContent>
              </Tabs>
            </motion.div>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 glass rounded-lg h-12 p-1 mb-6">
                  <TabsTrigger 
                    value="create"
                    className="data-[state=active]:glass-button rounded-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="data-[state=active]:glass-button rounded-md flex items-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                  <Card className="glass-card border-0">
                    <PrescriptionBuilder />
                  </Card>
                </TabsContent>

                <TabsContent value="history">
                  <PrescriptionList />
                </TabsContent>
              </Tabs>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </main>
  );
}