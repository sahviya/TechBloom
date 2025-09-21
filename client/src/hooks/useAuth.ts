import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";

interface User {
  id: string;
  email: string;
  name: string | null;
  profileImageUrl?: string | null;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const setUser = (newUser: User) => {
    queryClient.setQueryData(["/api/auth/user"], newUser);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    queryClient.setQueryData(["/api/auth/user"], null);
  };

  return {
    user,
    setUser,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };
}
