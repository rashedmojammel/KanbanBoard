'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BoardMember } from '@/types';
import * as membersService from '@/lib/services/members.service';
import { getErrorMessage } from '@/lib/error';

export function useMembers(boardId: string, enabled: boolean) {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await membersService.getMembers(boardId);
      setMembers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (enabled) void fetchMembers();
  }, [enabled, fetchMembers]);

  const addMember = useCallback(
    async (email: string) => {
      const member = await membersService.addMember(boardId, email);
      setMembers((prev) => [...prev, member]);
      return member;
    },
    [boardId],
  );

  const removeMember = useCallback(
    async (userId: string) => {
      await membersService.removeMember(boardId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    },
    [boardId],
  );

  return { members, isLoading, error, refetch: fetchMembers, addMember, removeMember };
}
