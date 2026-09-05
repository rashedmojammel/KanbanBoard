import { FiPlus } from 'react-icons/fi';

export function AddTaskButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <FiPlus className="h-3.5 w-3.5" /> Add task
    </button>
  );
}
