'use client';

import { useState } from 'react';
import { Season } from '@/constants/zod/season-schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface SeasonInfoCardProps {
  season: Season;
}

const DetailField = ({ label, value }: { label: string; value: string | number | null | undefined | React.ReactNode }) => (
  <div>
    <Label className="text-muted-foreground">{label}</Label>
    <p className="font-medium">{value ?? 'N/A'}</p>
  </div>
);


export default function SeasonInfoCard({ season }: SeasonInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: season.name,
    description: season.description || '',
  });

  // Get sport type from linked league (season doesn't have sportType directly)
  const sportType = season.leagues?.[0]?.sportType || season.category?.name || null;
  // Get game type from category
  const gameType = season.category?.gameType || season.category?.game_type || null;

  const handleSubmit = async () => {
    try {
      // Implement your update logic here
      // await axiosInstance.patch(endpoints.season.update(season.id), formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update season:', error);
    }
  };

  const formattedDate = (date: Date | null | undefined) => (date ? format(new Date(date), 'PPP') : 'N/A');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Season Details</CardTitle>
        <Button
          onClick={() => (isEditing ? handleSubmit() : setIsEditing(true))}
          variant={isEditing ? 'default' : 'outline'}
        >
          {isEditing ? 'Save Changes' : 'Edit Season'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {isEditing ? (
            <>
              <div className="col-span-full">
                <Label htmlFor="name">Season Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="col-span-full">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </>
          ) : (
            <>
              <DetailField label="Name" value={season.name} />
              <DetailField label="Status" value={
                <Badge variant="outline" className="capitalize">
                  {season.status}
                </Badge>
              } />
              <DetailField label="Category" value={season.category?.name} />
              <DetailField label="Game Type" value={
                gameType ? (
                  <Badge variant="outline" className="capitalize">
                    {gameType}
                  </Badge>
                ) : null
              } />
              <DetailField label="Start Date" value={formattedDate(season.startDate)} />
              <DetailField label="End Date" value={formattedDate(season.endDate)} />
              <DetailField label="Registration Deadline" value={formattedDate(season.regiDeadline)} />
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