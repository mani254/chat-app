import { Users } from "lucide-react";
import NewGroupModal from "./NewGroupModal";

// import NewGroupModal from "../NewGroupModal";

interface NoGroupsFoundProps {
  search: string;
}

const NoGroupsFound = ({ search }: NoGroupsFoundProps) => {
  const showSearchHint = Boolean(search?.trim());

  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 space-y-4 text-foreground-accent">
      <div className="p-4 rounded-full bg-background-accent">
        <Users className="w-7 h-7 text-foreground-accent/70" aria-hidden="true" />
      </div>

      <h2 className="text-lg font-semibold">No groups found</h2>

      <p className="text-sm text-center max-w-md">
        You haven’t joined or created any groups yet. Start by creating a new group using the button below.
      </p>

      {showSearchHint && (
        <p className="text-xs text-center text-muted-foreground">
          Try refining your search term
        </p>
      )}

      <div className="flex items-center justify-center">
        <NewGroupModal />
      </div>

    </section>
  );
};

export default NoGroupsFound;
