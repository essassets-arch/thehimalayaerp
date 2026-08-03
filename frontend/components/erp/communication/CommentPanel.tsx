'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Clock, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Comment {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface CommentPanelProps {
  entityType: string;
  entityId: string;
  includeInternal?: boolean;
  className?: string;
}

export function CommentPanel({ entityType, entityId, includeInternal = true, className }: CommentPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const queryClient = useQueryClient();

  const queryKey = ['comments', entityType, entityId, includeInternal];

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axios.get<any>(`/api/backend/comments`, {
        params: { entityType, entityId, includeInternal }
      });
      const body = res.data;
      return Array.isArray(body) 
        ? body 
        : Array.isArray(body?.data) 
          ? body.data 
          : Array.isArray(body?.comments)
            ? body.comments
            : Array.isArray(body?.items)
              ? body.items
              : [];
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: { message: string, isInternal: boolean }) => {
      const res = await axios.post(`/api/backend/comments`, {
        entityType,
        entityId,
        message: data.message,
        isInternal: data.isInternal
      });
      return res.data;
    },
    onSuccess: () => {
      setNewMessage('');
      setIsInternal(false);
      queryClient.invalidateQueries({ queryKey });
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    mutation.mutate({ message: newMessage.trim(), isInternal });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          Comments
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <Textarea 
            placeholder="Add a comment..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex items-center justify-between">
            {includeInternal ? (
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isInternal} 
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Lock className="h-3.5 w-3.5" />
                Internal note
              </label>
            ) : (
              <div /> // Spacer
            )}
            
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newMessage.trim() || mutation.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Post
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-sm text-gray-500 py-4">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-4 border border-dashed rounded-md bg-gray-50">
              No comments yet.
            </div>
          ) : (
            comments.map((comment: any) => (
              <div 
                key={comment.id} 
                className={`p-4 rounded-lg border text-sm ${
                  comment.isInternal ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    {comment.user?.name || 'User'} 
                    {comment.isInternal && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        <Lock className="h-3 w-3" /> Internal
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
