'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiGrid } from 'react-icons/fi';
import { EASE_OUT } from '@/lib/motion';

interface Task {
  id: string;
  label: string;
}

interface ColumnState {
  id: string;
  title: string;
  tasks: Task[];
}

const INITIAL_COLUMNS: ColumnState[] = [
  {
    id: 'todo',
    title: 'To do',
    tasks: [
      { id: 't1', label: 'Wireframe settings page' },
      { id: 't2', label: 'Write release notes' },
    ],
  },
  {
    id: 'progress',
    title: 'In progress',
    tasks: [{ id: 't3', label: 'API integration' }],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [{ id: 't4', label: 'Kickoff notes' }],
  },
];

/** Moves the first "To do" task into "In progress" once, shortly after mount. */
function useBoardDemo() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  useEffect(() => {
    const timer = setTimeout(() => {
      setColumns((prev) => {
        const [moving, ...restTodo] = prev[0].tasks;
        if (!moving) return prev;
        return [
          { ...prev[0], tasks: restTodo },
          { ...prev[1], tasks: [...prev[1].tasks, moving] },
          prev[2],
        ];
      });
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  return columns;
}

function TaskChip({ label }: { label: string }) {
  return (
    <motion.div
      layoutId={label}
      transition={{ duration: 0.55, ease: EASE_OUT }}
      className="rounded-md border border-brand-panel-border bg-white/[0.04] px-2.5 py-2 text-xs text-brand-panel-foreground/90 shadow-sm"
    >
      {label}
    </motion.div>
  );
}

function BoardPreview() {
  const columns = useBoardDemo();

  return (
    <div className="grid grid-cols-3 gap-3">
      {columns.map((column) => (
        <div key={column.id} className="min-w-0">
          <div className="mb-2 flex items-center gap-1.5 px-0.5">
            <span className="text-[11px] font-medium text-brand-panel-muted">{column.title}</span>
            <span className="text-[11px] text-brand-panel-muted/60">{column.tasks.length}</span>
          </div>
          <div className="flex min-h-[92px] flex-col gap-2 rounded-lg border border-brand-panel-border/60 bg-white/[0.02] p-2">
            {column.tasks.map((task) => (
              <TaskChip key={task.id} label={task.label} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-brand-panel lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
      {/* subtle dot-grid texture, not a gradient wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--brand-panel-border)) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-accent text-white">
          <FiGrid className="h-4 w-4" />
        </span>
        <span className="font-semibold tracking-tight text-brand-panel-foreground">Kanban</span>
      </div>

      <div className="relative max-w-md">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-brand-panel-foreground">
          Every task has a place, and every board tells you where things stand.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-brand-panel-muted">
          Create boards, invite your team, and move work from idea to done without losing track of who owns what.
        </p>

        <div className="mt-9">
          <BoardPreview />
        </div>
      </div>

      <p className="relative text-xs text-brand-panel-muted/70">Boards, columns, and tasks — organized the way your team actually works.</p>
    </div>
  );
}