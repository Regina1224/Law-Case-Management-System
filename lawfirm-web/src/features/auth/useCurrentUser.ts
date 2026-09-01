import { useState, useEffect } from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import { getCurrentUser, type CurrentUser } from "../../services/meService";

export const useCurrentUser = () => {
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const fetchUser = async () => {
        try
        {
            const result = await getCurrentUser();
            if (!cancelled) setUser(result);
        } finally {
            if (!cancelled) setLoading(false);
        }
    };
    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return {
    user: isAuthenticated ? user : null,
    loading: isAuthenticated ? loading : false,
  };
};