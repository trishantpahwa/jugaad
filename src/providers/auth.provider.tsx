import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Define the shape of the authentication context
interface AuthContextType {
  jwt: string;
  accessToken: string;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to access the authentication context
export const useGetAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return authContext;
};

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwt, setJWT] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    try {
      setJWT(localStorage.getItem("jwt") || "");
      setAccessToken(localStorage.getItem("accessToken") || "");
    } catch (error) {
      console.error(error);
      localStorage.clear();
      window.location.reload();
    }
  }, [children]);

  return (
    <AuthContext.Provider value={{ jwt, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
