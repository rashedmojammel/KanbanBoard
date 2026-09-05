'use client';

import { useEffect, useRef, useState } from 'react';
import { FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface ColumnHeaderProps {
  name: string;
  taskCount: number;
  onRename: (name: string) => Promise<void>;
  onDelete: () => void;
}

export function ColumnHeader({ name, taskCount, onRename, onDelete }: ColumnHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) inputRef.current?.focus();
  }, [isRenaming]);

  useEffect(() => {
    setValue(name);
  }, [name]);

  async function commitRename() {
    const trimmed = value.trim();
    setIsRenaming(false);
    if (!trimmed || trimmed === name) {
      setValue(name);
      return;
    }
    await onRename(trimmed);
  }

  return (
    <div className="flex items-center justify-between gap-2 px-1">
      {isRenaming ? (
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') {
              setValue(name);
              setIsRenaming(false);
            }
          }}
          className="h-7 text-sm font-medium"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsRenaming(true)}
          className="flex min-w-0 items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-accent"
        >
          <span className="truncate text-sm font-semibold text-foreground">{name}</span>
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            {taskCount}
          </span>
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          className="shrink-0 rounded-md p-1 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Column options"
        >
          <FiMoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setIsRenaming(true)}>
            <FiEdit2 className="h-3.5 w-3.5" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={onDelete}>
            <FiTrash2 className="h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
