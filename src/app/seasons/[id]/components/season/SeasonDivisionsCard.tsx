"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconTrophy,
  IconUsers,
  IconTarget,
  IconCalendar,
  IconDotsVertical,
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axiosInstance, { endpoints } from '@/lib/endpoints';
import DivisionCreateModal from '@/components/modal/division-create-modal';
import { Division } from '@/ZodSchema/division-schema';
import { toast } from 'sonner';


interface SeasonDivisionsCardProps {
  seasonId: string;
  adminId: string;
  divisions: Division[]; 
  isLoading?: boolean; 
  onDivisionCreated?: () => Promise<void>;
  onDivisionUpdated?: () => Promise<void>;
  onDivisionDeleted?: () => Promise<void>;
}

export default function SeasonDivisionsCard({ 
  seasonId, 
  adminId,
  divisions, 
  isLoading = false,
  onDivisionCreated,
  onDivisionUpdated,
  onDivisionDeleted
}: SeasonDivisionsCardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [deleteDivision, setDeleteDivision] = useState<Division | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDivisionCreated = () => {
    onDivisionCreated?.();
  };

  const handleEditDivision = (division: Division) => {
    setEditingDivision(division);
    setIsEditModalOpen(true);
  };

  const handleDivisionUpdated = () => {
    onDivisionUpdated?.();
    setIsEditModalOpen(false);
    setEditingDivision(null);
  };

  const handleDeleteRequest = (division: Division) => {
    setDeleteDivision(division);
    setIsDeleteOpen(true);
  };

  const handleDeleteDivision = async () => {
    if (!deleteDivision) return;
    
    setIsDeleting(true);
    try {
      await axiosInstance.delete(endpoints.division.delete(deleteDivision.id));
      toast.success('Division deleted successfully');
      onDivisionDeleted?.();
    } catch (error) {
      console.error('Failed to delete division:', error);
      toast.error('Failed to delete division');
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteDivision(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderValue = (value: any) => {
    if (value === null || value === undefined) return '—';
    return String(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            Divisions ({divisions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading divisions...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            Divisions ({divisions.length})
          </CardTitle>
          <DivisionCreateModal
            open={isCreateModalOpen}
            adminId={adminId}
            onOpenChange={setIsCreateModalOpen}
            onDivisionCreated={handleDivisionCreated}
            seasonId={seasonId}
          >
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <IconPlus className="size-4" />
              Create Division
            </Button>
          </DivisionCreateModal>
        </CardHeader>
        <CardContent>
          {divisions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <IconTrophy className="size-4" />
                        Division
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <div className="flex items-center gap-2">
                        <IconTarget className="size-4" />
                        Game Type
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Level</TableHead>
                    <TableHead className="w-[100px]">Gender</TableHead>
                    <TableHead className="w-[120px]">
                      <div className="flex items-center gap-2">
                        <IconUsers className="size-4" />
                        Players
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">
                      <div className="flex items-center gap-2">
                        <IconCalendar className="size-4" />
                        Created
                      </div>
                    </TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {divisions.map((division) => (
                    <TableRow key={division.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{division.name}</div>
                          {division.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {division.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {division.gameType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="capitalize text-xs"
                        >
                          {division.divisionLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="capitalize text-xs"
                        >
                          {division.genderCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {division.gameType === 'singles' 
                            ? `${division.currentSinglesCount || 0}/${renderValue(division.maxSingles)}`
                            : `${division.currentDoublesCount || 0}/${renderValue(division.maxDoublesTeams)}`
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={division.isActive ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {division.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(division.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <IconDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditDivision(division)}>
                              <IconEdit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRequest(division)}
                              className="text-destructive"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <IconTrophy className="size-12 opacity-50" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">No divisions found</p>
                  <p className="text-sm">Create your first division to get started</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Division Modal */}
      <DivisionCreateModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDivision(null);
          }
          setIsEditModalOpen(open);
        }}
        mode="edit"
        division={editingDivision}
        seasonId={seasonId}
        adminId={adminId}
        onDivisionCreated={handleDivisionUpdated} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Division</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDivision?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDivision}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}