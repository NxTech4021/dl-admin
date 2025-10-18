// "use client";

// import { useState, useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   IconTemplate,
//   IconPlus,
//   IconEdit,
//   IconTrash,
//   IconCheck,
//   IconX,
//   IconCopy,
//   IconStar,
//   IconUsers,
//   IconCurrencyDollar,
//   IconCalendar,
//   IconTarget,
//   IconTrophy,
// } from "@tabler/icons-react";

// interface LeagueTemplate {
//   id: string;
//   name: string;
//   sport: string;
//   description: string;
//   format: "singles" | "doubles" | "mixed" | "team";
//   maxPlayers: number;
//   entryFee: number;
//   currency: string;
//   duration: number; // weeks
//   divisions: {
//     name: string;
//     minRating: number;
//     maxRating: number;
//     maxPlayers: number;
//   }[];
//   prizes: {
//     position: number;
//     title: string;
//     value: number;
//     type: string;
//   }[];
//   rules: string[];
//   isPopular: boolean;
//   usageCount: number;
//   createdBy: string;
//   category: "official" | "community" | "custom";
// }

// interface LeagueTemplateModalProps {
//   onTemplateSelect: (template: LeagueTemplate) => void;
//   children?: React.ReactNode;
// }

// const defaultTemplates: LeagueTemplate[] = [
//   {
//     id: "tennis-singles",
//     name: "Tennis Singles Tournament",
//     sport: "Tennis",
//     description: "Professional tennis singles tournament format",
//     format: "singles",
//     maxPlayers: 32,
//     entryFee: 200,
//     currency: "RM",
//     duration: 6,
//     divisions: [
//       { name: "Open Division", minRating: 1000, maxRating: 2500, maxPlayers: 32 }
//     ],
//     prizes: [
//       { position: 1, title: "Champion", value: 2000, type: "cash" },
//       { position: 2, title: "Runner-up", value: 1000, type: "cash" },
//       { position: 3, title: "Semi-finalist", value: 500, type: "cash" },
//       { position: 4, title: "Semi-finalist", value: 500, type: "cash" }
//     ],
//     rules: [
//       "Best of 3 sets",
//       "Tiebreak at 6-6 in each set",
//       "No-ad scoring (first to 4 points wins game)",
//       "10-minute warm-up allowed"
//     ],
//     isPopular: true,
//     usageCount: 45,
//     createdBy: "System",
//     category: "official"
//   },
//   {
//     id: "tennis-doubles",
//     name: "Tennis Doubles League",
//     sport: "Tennis",
//     description: "Tennis doubles league with team registration",
//     format: "doubles",
//     maxPlayers: 32,
//     entryFee: 150,
//     currency: "RM",
//     duration: 8,
//     divisions: [
//       { name: "Premier Division", minRating: 1200, maxRating: 2500, maxPlayers: 16 },
//       { name: "Division 1", minRating: 800, maxRating: 1199, maxPlayers: 16 }
//     ],
//     prizes: [
//       { position: 1, title: "Champion Pair", value: 1500, type: "cash" },
//       { position: 2, title: "Runner-up Pair", value: 750, type: "cash" },
//       { position: 3, title: "Third Place Pair", value: 375, type: "cash" }
//     ],
//     rules: [
//       "Best of 3 sets",
//       "Tiebreak at 6-6 in each set",
//       "No-ad scoring (first to 4 points wins game)",
//       "10-minute warm-up allowed",
//       "Teams must register together"
//     ],
//     isPopular: false,
//     usageCount: 28,
//     createdBy: "System",
//     category: "official"
//   },
//   {
//     id: "pickleball-beginner",
//     name: "Pickleball Beginner League",
//     sport: "Pickleball",
//     description: "Perfect for new players looking to get into competitive pickleball",
//     format: "doubles",
//     maxPlayers: 24,
//     entryFee: 80,
//     currency: "RM",
//     duration: 8,
//     divisions: [
//       { name: "Beginner", minRating: 600, maxRating: 1000, maxPlayers: 24 }
//     ],
//     prizes: [
//       { position: 1, title: "Champion Team", value: 400, type: "cash" },
//       { position: 2, title: "Runner-up Team", value: 200, type: "cash" },
//       { position: 3, title: "Third Place Team", value: 100, type: "cash" }
//     ],
//     rules: [
//       "Best of 3 games to 11 points",
//       "Must win by 2 points",
//       "Service alternates every 2 points",
//       "Non-volley zone rules apply",
//       "2-minute break between games"
//     ],
//     isPopular: true,
//     usageCount: 38,
//     createdBy: "System",
//     category: "official"
//   },
//   {
//     id: "pickleball-advanced",
//     name: "Pickleball Advanced League",
//     sport: "Pickleball",
//     description: "For experienced pickleball players seeking competitive play",
//     format: "doubles",
//     maxPlayers: 32,
//     entryFee: 120,
//     currency: "RM",
//     duration: 10,
//     divisions: [
//       { name: "Advanced", minRating: 1000, maxRating: 1600, maxPlayers: 32 }
//     ],
//     prizes: [
//       { position: 1, title: "Champion Team", value: 800, type: "cash" },
//       { position: 2, title: "Runner-up Team", value: 400, type: "cash" },
//       { position: 3, title: "Third Place Team", value: 200, type: "cash" }
//     ],
//     rules: [
//       "Best of 3 games to 11 points",
//       "Must win by 2 points",
//       "Service alternates every 2 points",
//       "Non-volley zone rules apply",
//       "2-minute break between games",
//       "Must have played for at least 1 year"
//     ],
//     isPopular: false,
//     usageCount: 22,
//     createdBy: "System",
//     category: "official"
//   },
//   {
//     id: "padel-singles",
//     name: "Padel Singles League",
//     sport: "Padel",
//     description: "Padel singles league with glass court rules",
//     format: "singles",
//     maxPlayers: 24,
//     entryFee: 150,
//     currency: "RM",
//     duration: 8,
//     divisions: [
//       { name: "Open Division", minRating: 800, maxRating: 2000, maxPlayers: 24 }
//     ],
//     prizes: [
//       { position: 1, title: "Champion", value: 600, type: "cash" },
//       { position: 2, title: "Runner-up", value: 300, type: "cash" },
//       { position: 3, title: "Third Place", value: 150, type: "cash" }
//     ],
//     rules: [
//       "Best of 3 sets to 6 games",
//       "Tiebreak at 6-6 (first to 7 points)",
//       "Glass walls are in play",
//       "Underhand serve only",
//       "2-minute break between sets"
//     ],
//     isPopular: false,
//     usageCount: 15,
//     createdBy: "System",
//     category: "official"
//   },
//   {
//     id: "padel-doubles",
//     name: "Padel Doubles Championship",
//     sport: "Padel",
//     description: "Premium padel doubles championship with team registration",
//     format: "doubles",
//     maxPlayers: 32,
//     entryFee: 180,
//     currency: "RM",
//     duration: 10,
//     divisions: [
//       { name: "Championship Division", minRating: 1200, maxRating: 2200, maxPlayers: 16 },
//       { name: "Division 1", minRating: 800, maxRating: 1199, maxPlayers: 16 }
//     ],
//     prizes: [
//       { position: 1, title: "Champion Team", value: 1200, type: "cash" },
//       { position: 2, title: "Runner-up Team", value: 600, type: "cash" },
//       { position: 3, title: "Third Place Team", value: 300, type: "cash" }
//     ],
//     rules: [
//       "Best of 3 sets to 6 games",
//       "Tiebreak at 6-6 (first to 7 points)",
//       "Glass walls are in play",
//       "Underhand serve only",
//       "2-minute break between sets",
//       "Teams must register together"
//     ],
//     isPopular: true,
//     usageCount: 31,
//     createdBy: "System",
//     category: "official"
//   }
// ];

// export default function LeagueTemplateModal({
//   onTemplateSelect,
//   children
// }: LeagueTemplateModalProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [templates, setTemplates] = useState<LeagueTemplate[]>(defaultTemplates);
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedSport, setSelectedSport] = useState<string>("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
//   const createTemplateRef = useRef<HTMLDivElement>(null);
  
//   // Auto-scroll to create template form when it becomes visible
//   useEffect(() => {
//     if (isCreatingTemplate && createTemplateRef.current) {
//       setTimeout(() => {
//         createTemplateRef.current?.scrollIntoView({
//           behavior: 'smooth',
//           block: 'start',
//         });
//       }, 100); // Small delay to ensure the form is rendered
//     }
//   }, [isCreatingTemplate]);

//   const [newTemplate, setNewTemplate] = useState<Partial<LeagueTemplate>>({
//     name: "",
//     sport: "",
//     description: "",
//     format: "singles",
//     maxPlayers: 16,
//     entryFee: 100,
//     currency: "RM",
//     duration: 8,
//     divisions: [],
//     prizes: [],
//     rules: [],
//     category: "custom"
//   });

//   const sports = Array.from(new Set(templates.map(t => t.sport)));
//   const categories = [
//     { value: "all", label: "All Templates" },
//     { value: "official", label: "Official Templates" },
//     { value: "community", label: "Community Templates" },
//     { value: "custom", label: "My Templates" }
//   ];

//   const filteredTemplates = templates.filter(template => {
//     const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
//     const matchesSport = selectedSport === "all" || template.sport === selectedSport;
//     const matchesSearch = searchQuery === "" || 
//       template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
//     return matchesCategory && matchesSport && matchesSearch;
//   });

//   const handleSelectTemplate = (template: LeagueTemplate) => {
//     // Update usage count
//     setTemplates(templates.map(t => 
//       t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
//     ));
    
//     onTemplateSelect(template);
//     setIsOpen(false);
//     toast.success(`Template "${template.name}" selected!`);
//   };

//   const handleCreateTemplate = () => {
//     if (!newTemplate.name?.trim() || !newTemplate.sport?.trim()) {
//       toast.error("Template name and sport are required");
//       return;
//     }

//     const template: LeagueTemplate = {
//       id: `custom-${Date.now()}`,
//       name: newTemplate.name,
//       sport: newTemplate.sport,
//       description: newTemplate.description || "",
//       format: newTemplate.format || "singles",
//       maxPlayers: newTemplate.maxPlayers || 16,
//       entryFee: newTemplate.entryFee || 100,
//       currency: newTemplate.currency || "RM",
//       duration: newTemplate.duration || 8,
//       divisions: newTemplate.divisions || [],
//       prizes: newTemplate.prizes || [],
//       rules: newTemplate.rules || [],
//       isPopular: false,
//       usageCount: 0,
//       createdBy: "Admin",
//       category: "custom"
//     };

//     setTemplates([...templates, template]);
//     setIsCreatingTemplate(false);
//     setNewTemplate({
//       name: "",
//       sport: "",
//       description: "",
//       format: "singles",
//       maxPlayers: 16,
//       entryFee: 100,
//       currency: "RM",
//       duration: 8,
//       divisions: [],
//       prizes: [],
//       rules: [],
//       category: "custom"
//     });
//     toast.success("Custom template created successfully!");
//   };

//   const handleDeleteTemplate = (templateId: string) => {
//     const template = templates.find(t => t.id === templateId);
//     if (!template) return;

//     if (template.category === "official") {
//       toast.error("Cannot delete official templates");
//       return;
//     }

//     if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
//       setTemplates(templates.filter(t => t.id !== templateId));
//       toast.success("Template deleted successfully!");
//     }
//   };

//   const getCategoryBadgeVariant = (category: LeagueTemplate["category"]) => {
//     switch (category) {
//       case "official": return "default";
//       case "community": return "secondary";
//       case "custom": return "outline";
//       default: return "outline";
//     }
//   };

//   const getFormatIcon = (format: LeagueTemplate["format"]) => {
//     switch (format) {
//       case "singles": return <IconUsers className="size-4" />;
//       case "doubles": return <IconUsers className="size-4" />;
//       case "mixed": return <IconUsers className="size-4" />;
//       case "team": return <IconUsers className="size-4" />;
//       default: return <IconUsers className="size-4" />;
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         {children}
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <IconTemplate className="size-5" />
//             League Templates
//           </DialogTitle>
//           <DialogDescription>
//             Choose from pre-configured templates to quickly set up your league
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Filters and Search */}
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <Input
//                 placeholder="Search templates..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <div className="flex gap-2">
//               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//                 <SelectTrigger className="w-48">
//                   <SelectValue placeholder="Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.map((category) => (
//                     <SelectItem key={category.value} value={category.value}>
//                       {category.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Select value={selectedSport} onValueChange={setSelectedSport}>
//                 <SelectTrigger className="w-40">
//                   <SelectValue placeholder="Sport" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Sports</SelectItem>
//                   {sports.map((sport) => (
//                     <SelectItem key={sport} value={sport}>
//                       {sport}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsCreatingTemplate(true)}
//               >
//                 <IconPlus className="size-4 mr-2" />
//                 Create Template
//               </Button>
//             </div>
//           </div>

//           {/* Templates Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredTemplates.map((template) => (
//               <Card key={template.id} className="relative">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-start justify-between">
//                     <div className="space-y-1">
//                       <div className="flex items-center gap-2">
//                         <CardTitle className="text-base">{template.name}</CardTitle>
//                         {template.isPopular && (
//                           <IconStar className="size-4 text-yellow-500 fill-current" />
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Badge variant={getCategoryBadgeVariant(template.category)}>
//                           {template.category}
//                         </Badge>
//                         <Badge variant="outline">{template.sport}</Badge>
//                       </div>
//                     </div>
//                     {template.category !== "official" && (
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleDeleteTemplate(template.id)}
//                       >
//                         <IconTrash className="size-4" />
//                       </Button>
//                     )}
//                   </div>
//                   <CardDescription className="text-sm">
//                     {template.description}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {/* Template Stats */}
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div className="flex items-center gap-2">
//                       {getFormatIcon(template.format)}
//                       <span>{template.format}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <IconUsers className="size-4" />
//                       <span>{template.maxPlayers} players</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <IconCurrencyDollar className="size-4" />
//                       <span>{template.currency} {template.entryFee}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <IconCalendar className="size-4" />
//                       <span>{template.duration} weeks</span>
//                     </div>
//                   </div>

//                   {/* Quick Stats */}
//                   <div className="flex justify-between text-xs text-muted-foreground">
//                     <span>{template.divisions.length} division{template.divisions.length !== 1 ? 's' : ''}</span>
//                     <span>{template.prizes.length} prize{template.prizes.length !== 1 ? 's' : ''}</span>
//                     <span>Used {template.usageCount} times</span>
//                   </div>

//                   {/* Actions */}
//                   <div className="flex gap-2">
//                     <Button
//                       className="flex-1"
//                       onClick={() => handleSelectTemplate(template)}
//                     >
//                       <IconCheck className="size-4 mr-2" />
//                       Use Template
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {filteredTemplates.length === 0 && (
//             <div className="text-center py-12">
//               <IconTemplate className="size-12 mx-auto text-muted-foreground mb-4" />
//               <h3 className="text-lg font-semibold mb-2">No templates found</h3>
//               <p className="text-muted-foreground mb-4">
//                 Try adjusting your filters or create a new template
//               </p>
//               <Button onClick={() => setIsCreatingTemplate(true)}>
//                 <IconPlus className="size-4 mr-2" />
//                 Create New Template
//               </Button>
//             </div>
//           )}

//           {/* Create Template Form */}
//           {isCreatingTemplate && (
//             <Card ref={createTemplateRef}>
//               <CardHeader>
//                 <CardTitle className="text-sm">Create Custom Template</CardTitle>
//                 <CardDescription>
//                   Create a reusable template for future leagues
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="templateName">Template Name *</Label>
//                     <Input
//                       id="templateName"
//                       value={newTemplate.name || ""}
//                       onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
//                       placeholder="e.g., Advanced Badminton Tournament"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="templateSport">Sport *</Label>
//                     <Input
//                       id="templateSport"
//                       value={newTemplate.sport || ""}
//                       onChange={(e) => setNewTemplate(prev => ({ ...prev, sport: e.target.value }))}
//                       placeholder="e.g., Badminton, Tennis"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="templateDescription">Description</Label>
//                   <Textarea
//                     id="templateDescription"
//                     value={newTemplate.description || ""}
//                     onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
//                     placeholder="Describe when this template should be used..."
//                     rows={2}
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="templateFormat">Format</Label>
//                     <Select
//                       value={newTemplate.format}
//                       onValueChange={(value: LeagueTemplate["format"]) => setNewTemplate(prev => ({ ...prev, format: value }))}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="singles">Singles</SelectItem>
//                         <SelectItem value="doubles">Doubles</SelectItem>
//                         <SelectItem value="mixed">Mixed</SelectItem>
//                         <SelectItem value="team">Team</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="templateMaxPlayers">Max Players</Label>
//                     <Input
//                       id="templateMaxPlayers"
//                       type="number"
//                       value={newTemplate.maxPlayers || ""}
//                       onChange={(e) => setNewTemplate(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 16 }))}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="templateDuration">Duration (weeks)</Label>
//                     <Input
//                       id="templateDuration"
//                       type="number"
//                       value={newTemplate.duration || ""}
//                       onChange={(e) => setNewTemplate(prev => ({ ...prev, duration: parseInt(e.target.value) || 8 }))}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="templateEntryFee">Entry Fee</Label>
//                     <Input
//                       id="templateEntryFee"
//                       type="number"
//                       value={newTemplate.entryFee || ""}
//                       onChange={(e) => setNewTemplate(prev => ({ ...prev, entryFee: parseFloat(e.target.value) || 100 }))}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="templateCurrency">Currency</Label>
//                     <Select
//                       value={newTemplate.currency}
//                       onValueChange={(value) => setNewTemplate(prev => ({ ...prev, currency: value }))}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="RM">Malaysian Ringgit (RM)</SelectItem>
//                         <SelectItem value="USD">US Dollar ($)</SelectItem>
//                         <SelectItem value="SGD">Singapore Dollar (S$)</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => setIsCreatingTemplate(false)}
//                   >
//                     <IconX className="size-4 mr-2" />
//                     Cancel
//                   </Button>
//                   <Button onClick={handleCreateTemplate}>
//                     <IconCheck className="size-4 mr-2" />
//                     Create Template
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
