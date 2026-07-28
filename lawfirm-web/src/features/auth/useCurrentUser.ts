import { useState, useEffect } from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import { getCurrentUser, type CurrentUser } from "../../services/meService";

export const useCurrentUser = () => {
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(isAuthenticated == false)
    {
        setUser(null);
        setLoading(false);
        return;
    }

    const fetchUser = async () => {
        try
        {
            const result = await getCurrentUser();
            setUser(result);
        } finally {
            setLoading(false);
        } 
    };
    fetchUser();
  }, [isAuthenticated]);

  return { user, loading };
};