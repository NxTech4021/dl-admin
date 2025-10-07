// app/seasons/[id]/components/SeasonInfoCard.tsx
'use client';

import { useState } from 'react';
import { FullSeason } from '@/MockData/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface SeasonInfoCardProps {
  season: FullSeason;
}

const DetailField = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <Label className="text-muted-foreground">{label}</Label>
    <p className="font-medium">{value}</p>
  </div>
);

export default function SeasonInfoCard({ season }: SeasonInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Initial form state (you'd use a real form library like react-hook-form here)
  const [formData, setFormData] = useState({
    name: season.name,
    description: season.description || '',
    entryFee: season.entryFee,
    // ... other fields
  });

  const handleSubmit = () => {
    // Implement save logic here
    console.log('Saving changes:', formData);
    setIsEditing(false);
  };

  const formattedDate = (date: Date | null) => (date ? format(new Date(date), 'PPP') : 'N/A');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Season Details</CardTitle>
        <Button onClick={() => (isEditing ? handleSubmit() : setIsEditing(true))} variant={isEditing ? 'default' : 'outline'}>
          {isEditing ? 'Save Changes' : 'Update Season'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {isEditing ? (
            <>
              {/* Form inputs when editing */}
              <div className="col-span-full">
                <Label htmlFor="name">Season Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              {/* Add more form fields here */}
            </>
          ) : (
            <>
              {/* Read-only details */}
              <DetailField label="Name" value={season.name} />
              <DetailField label="Status" value={season.status} />
              <DetailField label="Sport Type" value={season.sportType || 'N/A'} />
              <DetailField label="Season Type" value={season.seasonType} />
              <DetailField label="Entry Fee" value={`$${season.entryFee.toFixed(2)}`} />
              <DetailField label="Registered Users" value={season.registeredUserCount} />
              
              <DetailField label="Start Date" value={formattedDate(season.startDate)} />
              <DetailField label="End Date" value={formattedDate(season.endDate)} />
              <DetailField label="Registration Deadline" value={formattedDate(season.regiDeadline)} />

              <DetailField label="League" value={season.league.name} />
              <DetailField label="Category" value={season.category.name} />
              <div className="col-span-full">
                <DetailField label="Description" value={season.description || 'No description provided.'} />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}