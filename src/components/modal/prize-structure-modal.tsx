"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconTrophy,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconGift,
  IconCurrencyDollar,
  IconMedal,
  IconStar,
  IconAward,
  IconTicket,
} from "@tabler/icons-react";

interface Prize {
  id: string;
  position: number;
  title: string;
  type: "cash" | "voucher" | "trophy" | "medal" | "gift" | "other";
  value: number;
  description: string;
  sponsor?: string;
  quantity: number;
  currency: string;
}

interface PrizeStructureModalProps {
  currentPrizes?: Prize[];
  onPrizesUpdate: (prizes: Prize[]) => void;
  children?: React.ReactNode;
  leagueName?: string;
}

const prizeTypes = [
  { value: "cash", label: "Cash Prize", icon: IconCurrencyDollar },
  { value: "voucher", label: "Voucher", icon: IconTicket },
  { value: "trophy", label: "Trophy", icon: IconTrophy },
  { value: "medal", label: "Medal", icon: IconMedal },
  { value: "gift", label: "Gift/Product", icon: IconGift },
  { value: "other", label: "Other", icon: IconAward },
];

const currencies = [
  { value: "RM", label: "Malaysian Ringgit (RM)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "SGD", label: "Singapore Dollar (S$)" },
];

const defaultPrizes: Prize[] = [
  {
    id: "1",
    position: 1,
    title: "Champion",
    type: "cash",
    value: 1000,
    description: "First place cash prize plus trophy",
    quantity: 1,
    currency: "RM",
  },
  {
    id: "2",
    position: 2,
    title: "Runner-up",
    type: "cash",
    value: 500,
    description: "Second place cash prize plus medal",
    quantity: 1,
    currency: "RM",
  },
  {
    id: "3",
    position: 3,
    title: "Third Place",
    type: "cash",
    value: 250,
    description: "Third place cash prize plus medal",
    quantity: 1,
    currency: "RM",
  },
];

export default function PrizeStructureModal({
  currentPrizes = defaultPrizes,
  onPrizesUpdate,
  children,
  leagueName = "League",
}: PrizeStructureModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>(currentPrizes);
  const [isAddingPrize, setIsAddingPrize] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  
  // Refs for auto-scroll functionality
  const addPrizeFormRef = useRef<HTMLDivElement>(null);
  const editPrizeFormRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to add prize form when it becomes visible
  useEffect(() => {
    if (isAddingPrize && addPrizeFormRef.current) {
      setTimeout(() => {
        addPrizeFormRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100); // Small delay to ensure the form is rendered
    }
  }, [isAddingPrize]);
  
  // Auto-scroll to edit prize form when it becomes visible
  useEffect(() => {
    if (editingPrize && editPrizeFormRef.current) {
      setTimeout(() => {
        editPrizeFormRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100); // Small delay to ensure the form is rendered
    }
  }, [editingPrize]);

  const [newPrize, setNewPrize] = useState<Partial<Prize>>({
    position: prizes.length + 1,
    title: "",
    type: "cash",
    value: 0,
    description: "",
    quantity: 1,
    currency: "RM",
  });

  const handleAddPrize = () => {
    if (!newPrize.title?.trim()) {
      toast.error("Prize title is required");
      return;
    }

    const prize: Prize = {
      id: Date.now().toString(),
      position: newPrize.position || prizes.length + 1,
      title: newPrize.title,
      type: newPrize.type || "cash",
      value: newPrize.value || 0,
      description: newPrize.description || "",
      sponsor: newPrize.sponsor,
      quantity: newPrize.quantity || 1,
      currency: newPrize.currency || "RM",
    };

    setPrizes([...prizes, prize].sort((a, b) => a.position - b.position));
    setIsAddingPrize(false);
    setNewPrize({
      position: prizes.length + 2,
      title: "",
      type: "cash",
      value: 0,
      description: "",
      quantity: 1,
      currency: "RM",
    });
    toast.success("Prize added successfully!");
  };

  const handleEditPrize = (prize: Prize) => {
    setEditingPrize({ ...prize });
  };

  const handleUpdatePrize = () => {
    if (!editingPrize) return;

    setPrizes(prizes.map(p => p.id === editingPrize.id ? editingPrize : p));
    setEditingPrize(null);
    toast.success("Prize updated successfully!");
  };

  const handleDeletePrize = (prizeId: string) => {
    if (confirm("Are you sure you want to delete this prize?")) {
      setPrizes(prizes.filter(p => p.id !== prizeId));
      toast.success("Prize deleted successfully!");
    }
  };

  const handleSave = () => {
    onPrizesUpdate(prizes);
    setIsOpen(false);
    toast.success("Prize structure updated successfully!");
  };

  const getTotalPrizeValue = () => {
    return prizes.reduce((total, prize) => {
      if (prize.type === "cash" || prize.type === "voucher") {
        return total + (prize.value * prize.quantity);
      }
      return total;
    }, 0);
  };

  const getPrizeTypeIcon = (type: Prize["type"]) => {
    const prizeType = prizeTypes.find(pt => pt.value === type);
    const IconComponent = prizeType?.icon || IconAward;
    return <IconComponent className="size-4" />;
  };

  const getPrizeTypeColor = (type: Prize["type"]) => {
    switch (type) {
      case "cash": return "text-green-600";
      case "voucher": return "text-blue-600";
      case "trophy": return "text-yellow-600";
      case "medal": return "text-purple-600";
      case "gift": return "text-pink-600";
      default: return "text-gray-600";
    }
  };

  const resetModal = () => {
    setPrizes(currentPrizes);
    setIsAddingPrize(false);
    setEditingPrize(null);
    setNewPrize({
      position: currentPrizes.length + 1,
      title: "",
      type: "cash",
      value: 0,
      description: "",
      quantity: 1,
      currency: "RM",
    });
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetModal();
      }}
    >
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            Prize Structure Management
          </DialogTitle>
          <DialogDescription>
            Configure prizes and rewards for {leagueName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prize Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Prize Pool Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    RM {getTotalPrizeValue().toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Cash Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{prizes.length}</div>
                  <div className="text-sm text-muted-foreground">Total Prizes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {prizes.reduce((total, prize) => total + prize.quantity, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Prizes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prize List</h3>
              <Button
                onClick={() => setIsAddingPrize(true)}
                size="sm"
              >
                <IconPlus className="size-4 mr-2" />
                Add Prize
              </Button>
            </div>

            <div className="space-y-3">
              {prizes.map((prize) => (
                <Card key={prize.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-sm">{prize.position}</span>
                          </div>
                          <div className={`${getPrizeTypeColor(prize.type)}`}>
                            {getPrizeTypeIcon(prize.type)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{prize.title}</h4>
                            <Badge variant="outline">
                              {prizeTypes.find(pt => pt.value === prize.type)?.label}
                            </Badge>
                            {prize.quantity > 1 && (
                              <Badge variant="secondary">×{prize.quantity}</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {prize.description}
                          </div>
                          {prize.sponsor && (
                            <div className="text-xs text-muted-foreground">
                              Sponsored by: {prize.sponsor}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {(prize.type === "cash" || prize.type === "voucher") && (
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              {prize.currency} {prize.value.toLocaleString()}
                            </div>
                            {prize.quantity > 1 && (
                              <div className="text-xs text-muted-foreground">
                                Total: {prize.currency} {(prize.value * prize.quantity).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPrize(prize)}
                          >
                            <IconEdit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrize(prize.id)}
                          >
                            <IconTrash className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Add Prize Form */}
          {isAddingPrize && (
            <Card ref={addPrizeFormRef}>
              <CardHeader>
                <CardTitle className="text-sm">Add New Prize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPrizeTitle">Prize Title *</Label>
                    <Input
                      id="newPrizeTitle"
                      value={newPrize.title || ""}
                      onChange={(e) => setNewPrize(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Champion, Runner-up"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPrizePosition">Position</Label>
                    <Input
                      id="newPrizePosition"
                      type="number"
                      value={newPrize.position || ""}
                      onChange={(e) => setNewPrize(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPrizeType">Prize Type *</Label>
                    <Select
                      value={newPrize.type}
                      onValueChange={(value: Prize["type"]) => setNewPrize(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select prize type" />
                      </SelectTrigger>
                      <SelectContent>
                        {prizeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="size-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPrizeQuantity">Quantity</Label>
                    <Input
                      id="newPrizeQuantity"
                      type="number"
                      value={newPrize.quantity || ""}
                      onChange={(e) => setNewPrize(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      placeholder="1"
                    />
                  </div>
                </div>

                {(newPrize.type === "cash" || newPrize.type === "voucher") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPrizeValue">Value *</Label>
                      <Input
                        id="newPrizeValue"
                        type="number"
                        value={newPrize.value || ""}
                        onChange={(e) => setNewPrize(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPrizeCurrency">Currency</Label>
                      <Select
                        value={newPrize.currency}
                        onValueChange={(value) => setNewPrize(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPrizeDescription">Description</Label>
                  <Textarea
                    id="newPrizeDescription"
                    value={newPrize.description || ""}
                    onChange={(e) => setNewPrize(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the prize details..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPrizeSponsor">Sponsor (Optional)</Label>
                  <Input
                    id="newPrizeSponsor"
                    value={newPrize.sponsor || ""}
                    onChange={(e) => setNewPrize(prev => ({ ...prev, sponsor: e.target.value }))}
                    placeholder="Sponsor name or company"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingPrize(false)}
                  >
                    <IconX className="size-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleAddPrize}>
                    <IconCheck className="size-4 mr-2" />
                    Add Prize
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Prize Form */}
          {editingPrize && (
            <Card ref={editPrizeFormRef}>
              <CardHeader>
                <CardTitle className="text-sm">Edit Prize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editPrizeTitle">Prize Title *</Label>
                    <Input
                      id="editPrizeTitle"
                      value={editingPrize.title}
                      onChange={(e) => setEditingPrize(prev => prev ? { ...prev, title: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPrizePosition">Position</Label>
                    <Input
                      id="editPrizePosition"
                      type="number"
                      value={editingPrize.position}
                      onChange={(e) => setEditingPrize(prev => prev ? { ...prev, position: parseInt(e.target.value) || 1 } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editPrizeType">Prize Type *</Label>
                    <Select
                      value={editingPrize.type}
                      onValueChange={(value: Prize["type"]) => setEditingPrize(prev => prev ? { ...prev, type: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {prizeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="size-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPrizeQuantity">Quantity</Label>
                    <Input
                      id="editPrizeQuantity"
                      type="number"
                      value={editingPrize.quantity}
                      onChange={(e) => setEditingPrize(prev => prev ? { ...prev, quantity: parseInt(e.target.value) || 1 } : null)}
                    />
                  </div>
                </div>

                {(editingPrize.type === "cash" || editingPrize.type === "voucher") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editPrizeValue">Value *</Label>
                      <Input
                        id="editPrizeValue"
                        type="number"
                        value={editingPrize.value}
                        onChange={(e) => setEditingPrize(prev => prev ? { ...prev, value: parseFloat(e.target.value) || 0 } : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPrizeCurrency">Currency</Label>
                      <Select
                        value={editingPrize.currency}
                        onValueChange={(value) => setEditingPrize(prev => prev ? { ...prev, currency: value } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="editPrizeDescription">Description</Label>
                  <Textarea
                    id="editPrizeDescription"
                    value={editingPrize.description}
                    onChange={(e) => setEditingPrize(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editPrizeSponsor">Sponsor (Optional)</Label>
                  <Input
                    id="editPrizeSponsor"
                    value={editingPrize.sponsor || ""}
                    onChange={(e) => setEditingPrize(prev => prev ? { ...prev, sponsor: e.target.value } : null)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingPrize(null)}
                  >
                    <IconX className="size-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePrize}>
                    <IconCheck className="size-4 mr-2" />
                    Update Prize
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <IconCheck className="size-4 mr-2" />
              Save Prize Structure
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
