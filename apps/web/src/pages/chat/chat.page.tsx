import { Button, Logo, Spinner } from '@org/ui';
import { useCurrentUser, useLogout } from '@org/internal-sdk';
import { LogOut, MessageSquare } from 'lucide-react';

export function ChatPage() {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col">
      {/* Header Bar */}
      <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shadow-sm">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Spinner size="sm" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.email}</p>
              </div>
            </div>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            isLoading={logoutMutation.isPending}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Body / Active Chat Dashboard Placeholder */}
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to ChatApp Dashboard
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Authentication successfully verified! Both Email/Password and Google sign-in methods are active.
          </p>
        </div>
      </main>
    </div>
  );
}
