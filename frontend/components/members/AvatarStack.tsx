import { NameAvatar } from '@/components/ui/avatar';
import type { BoardMember } from '@/types';

export function AvatarStack({ members, max = 4 }: { members: BoardMember[]; max?: number }) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;

  if (members.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((member) => (
        <NameAvatar
          key={member.id}
          name={member.user.name}
          className="border-2 border-background"
        />
      ))}
      {overflow > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
          +{overflow}
        </div>
      )}
    </div>
  );
}
