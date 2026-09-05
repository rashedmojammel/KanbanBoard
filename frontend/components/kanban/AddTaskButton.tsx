import { FiPlus } from 'react-icons/fi';

export function AddTaskButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-brand-accent/10 hover:text-brand-accent"
    >
      <FiPlus className="h-3.5 w-3.5" /> Add task
    </button>
  );
}