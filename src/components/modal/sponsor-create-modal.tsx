// src/components/SponsorCreateModal.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'; 
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosInstance,{ endpoints } from '@/lib/endpoints';
import axios from 'axios';



interface SponsorCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSponsorCreated: (sponsor: any) => void; 
}

export function SponsorCreateModal({ open, onOpenChange, onSponsorCreated }: SponsorCreateModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Sponsor name cannot be empty.");
      return;
    }
    
    setLoading(true);
    try {
   
      const res = await axiosInstance.post(endpoints.companies.create , { name });
      onSponsorCreated(res.data.data.company); 
      
      // Close the modal
      onOpenChange(false); 
      
      // Clear the input field for next use
      setName(""); 
      
      toast.success("Sponsor created!");

    } catch (err) {
    
      let errorMessage = "Failed to create sponsor";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]"> 
        <DialogHeader>
          <DialogTitle>Create Sponsor</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2"> {/* Added py-2 for padding consistency */}
          <div className="space-y-2">
            <Label htmlFor="sponsor-name">Sponsor Name</Label>
            <Input 
              id="sponsor-name"
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Acme Corporation"
              // Allow pressing Enter to submit the form
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && name.trim()) {
                  handleCreate();
                }
              }}
            />
          </div>
        </div>
        
        <DialogFooter>
          {/* Button is disabled if loading or if the name is empty */}
          <Button 
            onClick={handleCreate} 
            disabled={loading || !name.trim()}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}