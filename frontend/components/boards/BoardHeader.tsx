'use client';

import Link from 'next/link';
import { FiChevronLeft, FiMoreVertical, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AvatarStack } from '@/components/members/AvatarStack';
import type { Board, BoardMember } from '@/types';

interface BoardHeaderProps {
  board: Board;
  members: BoardMember[];
  isOwner: boolean;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function BoardHeader({ board, members, isOwner, onShare, onEdit, onDelete }: BoardHeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="container flex h-16 max-w-[calc(100vw-2rem)] items-center justify-between gap-4 lg:max-w-7xl">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Back to boards"
          >
            <FiChevronLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground">{board.name}</h1>
            {board.description && (
              <p className="truncate text-xs text-muted-foreground">{board.description}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <AvatarStack members={members} />

          <Button variant="outline" size="sm" onClick={onShare}>
            <FiUsers className="h-4 w-4" /> Share
          </Button>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Board options"
              >
                <FiMoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit}>
                  <FiEdit2 className="h-3.5 w-3.5" /> Edit board
                </DropdownMenuItem>
                <DropdownMenuItem destructive onSelect={onDelete}>
                  <FiTrash2 className="h-3.5 w-3.5" /> Delete board
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
