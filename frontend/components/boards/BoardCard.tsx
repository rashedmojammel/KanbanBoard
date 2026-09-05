'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiColumns, FiCheckSquare, FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelativeTime } from '@/lib/utils';
import { staggerItem } from '@/lib/motion';
import type { Board } from '@/types';

interface BoardCardProps {
  board: Board;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function BoardCard({ board, isOwner, onEdit, onDelete }: BoardCardProps) {
  return (
    <motion.div
      layout="position"
      variants={staggerItem}
      exit="exit"
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="group relative flex flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/boards/${board.id}`} className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-foreground">{board.name}</h3>
        </Link>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-md p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
              aria-label="Board options"
              onClick={(e) => e.stopPropagation()}
            >
              <FiMoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onEdit();
                }}
              >
                <FiEdit2 className="h-4 w-4" /> Edit board
              </DropdownMenuItem>
              <DropdownMenuItem
                destructive
                onSelect={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
              >
                <FiTrash2 className="h-4 w-4" /> Delete board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Link href={`/boards/${board.id}`} className="flex flex-1 flex-col">
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {board.description || 'No description'}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FiColumns className="h-3.5 w-3.5" />
            {board._count?.columns ?? 0} columns
          </span>
          <span className="flex items-center gap-1.5">
            <FiCheckSquare className="h-3.5 w-3.5" />
            {board.taskCount ?? 0} tasks
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <Badge variant={isOwner ? 'default' : 'outline'}>{isOwner ? 'Owner' : 'Member'}</Badge>
          <span className="text-xs text-muted-foreground">Updated {formatRelativeTime(board.updatedAt)}</span>
        </div>
      </Link>
    </motion.div>
  );
}
