import { Users } from "lucide-react";



const NoActiveUsersFound = () => {

  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 space-y-4 text-foreground-accent">
      <div className="p-4 rounded-full bg-background-accent">
        <Users className="w-7 h-7 text-foreground-accent/70" aria-hidden="true" />
      </div>

      <h2 className="text-lg font-semibold">No active users</h2>

      <p className="text-sm text-center max-w-md">
        It looks like there are no users online right now. Active users will appear here when they come online.
      </p>

    </section>
  );
};

export default NoActiveUsersFound;
