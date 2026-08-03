'use client';

import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, X, FileIcon, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  uploadedAt: string;
  user?: {
    name: string;
  };
}

interface AttachmentUploaderProps {
  entityType: string;
  entityId: string;
  className?: string;
}

export function AttachmentUploader({ entityType, entityId, className }: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const queryKey = ['attachments', entityType, entityId];

  const { data: attachments = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axios.get<any>(`/api/backend/attachments`, {
        params: { entityType, entityId }
      });
      const body = res.data;
      return Array.isArray(body) 
        ? body 
        : Array.isArray(body?.data) 
          ? body.data 
          : Array.isArray(body?.attachments)
            ? body.attachments
            : Array.isArray(body?.items)
              ? body.items
              : [];
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // In a real app, you would upload to S3/Cloudinary and get a URL back.
      // For this prototype, we'll simulate an upload and just save the metadata.
      setIsUploading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network
      
      const res = await axios.post(`/api/backend/attachments`, {
        entityType,
        entityId,
        fileName: file.name,
        fileUrl: `/uploads/${file.name}`, // Fake URL
        fileSize: file.size,
        mimeType: file.type
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('File uploaded successfully');
      setIsUploading(false);
    },
    onError: () => {
      toast.error('Failed to upload file');
      setIsUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/backend/attachments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('File removed');
    },
    onError: () => {
      toast.error('Failed to remove file');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-gray-500" />
          Attachments
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-sm text-gray-500 py-4">Loading attachments...</div>
          ) : attachments.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8 border border-dashed rounded-md bg-gray-50 flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-300" />
              <p>No attachments uploaded yet.</p>
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                Click to upload
              </Button>
            </div>
          ) : (
            attachments.map((file: any) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                    <FileIcon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatBytes(file.fileSize)} • {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                    onClick={() => deleteMutation.mutate(file.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
