import React, { ReactNode, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";

interface Props {
  children: ReactNode;
}

const ProtectedComponent: React.FC<Props> = ({ children }) => {
  const { getCurrentUser, isAuthenticated } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      await getCurrentUser();
    };
    fetchUser();
  }, [getCurrentUser]);

  if (!isAuthenticated) return <div>Loading or redirecting...</div>;

  return <>{children}</>;
};

export default ProtectedComponent;