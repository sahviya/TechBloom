import { useState, useEffect, useCallback, FormEvent } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";

interface GoogleResponse {
  credential: string;
}

interface GoogleNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
}

interface GoogleButtonOptions {
  theme: 'outline' | 'filled' | 'filled_blue' | 'filled_black';
  size: 'large' | 'medium' | 'small';
  text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface GoogleInitializeOptions {
  client_id: string;
  callback: (response: GoogleResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  ux_mode?: 'popup' | 'redirect';
  itp_support?: boolean;
  prompt_parent_id?: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  profileImageUrl?: string | null;
}

interface AuthResponse {
  token: string;
  user: User;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitializeOptions) => void;
          renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
          prompt: (notificationCallback?: (notification: GoogleNotification) => void) => void;
        };
      };
    };
  }
}

export default function Login() {
  const [, navigate] = useLocation();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleGoogleSignIn = useCallback(
    async (response: GoogleResponse) => {
      try {
        console.log("Google Sign-In callback triggered with response:", response);
        setLoading(true);
        
        const res = await apiRequest("POST", "/api/auth/google", {
          idToken: response.credential,
        });

        console.log("Server response received");
        const data = await res.json() as AuthResponse;
        
        if (data?.token && data?.user) {
          console.log("Auth token received from Google login");
          localStorage.setItem("auth_token", data.token);
          
          // Log user data for debugging
          console.log("Received user data:", {
            ...data.user,
            token: "HIDDEN"
          });
          
          // Update auth state first
          setUser(data.user);
          
          // Then navigate
          navigate("/dashboard", { replace: true });
          // Don't reload the page as it causes the createRoot error
        } else {
          console.error("No token in response:", data);
          setError("Authentication failed: No token received");
        }
      } catch (error) {
        const err = error as Error;
        console.error("Login error:", err);
        setError(`Google Sign-In failed: ${err.message}`);
        console.log("Debug Info:", {
          origin: window.location.origin,
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          isProd: import.meta.env.PROD,
          redirectUri: import.meta.env.PROD 
            ? import.meta.env.VITE_REDIRECT_URI_PROD 
            : import.meta.env.VITE_REDIRECT_URI_LOCAL
        });
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const handleEmailSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
        const res = await apiRequest("POST", endpoint, {
          email,
          password,
          name: email.split("@")[0],
        });
        const data = await res.json() as AuthResponse;
        if (data?.token && data?.user) {
          console.log("Login successful via email");
          localStorage.setItem("auth_token", data.token);
          
          // Update auth state first
          setUser(data.user);
          
          // Then navigate
          navigate("/dashboard", { replace: true });
        } else {
          console.error("Login failed - no token in response");
          setError(isSignup ? "Signup failed" : "Login failed");
        }
      } catch (error) {
        const err = error as Error;
        setError(err.message || (isSignup ? "Signup failed" : "Login failed"));
      } finally {
        setLoading(false);
      }
    },
    [email, password, isSignup, navigate]
  );

  const initializeGoogleSignIn = useCallback(
    (clientId: string): boolean => {
      if (!window.google?.accounts?.id) {
        console.error("Google Sign-In API not available");
        return false;
      }

      try {
        const { id } = window.google.accounts;
        const currentOrigin = window.location.origin;
        console.log("Initializing Google Sign-In:", {
          client_id: clientId,
          origin: currentOrigin,
          isProd: import.meta.env.PROD,
          redirectUri: import.meta.env.PROD 
            ? import.meta.env.VITE_REDIRECT_URI_PROD 
            : import.meta.env.VITE_REDIRECT_URI_LOCAL
        });

        // Initialize with strict settings to prevent auto-selection issues
        const initOptions: GoogleInitializeOptions = {
          client_id: clientId,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
          ux_mode: 'popup',
          itp_support: true
        };

        console.log('Initializing Google Sign-In with options:', {
          ...initOptions,
          callback: '[Function]'
        });

        id.initialize(initOptions);

        const buttonContainer = document.getElementById("googleSignIn");
        if (buttonContainer instanceof HTMLElement) {
          id.renderButton(buttonContainer, {
            theme: "filled_blue",
            size: "large",
            text: "continue_with",
            width: buttonContainer.offsetWidth,
          });

          id.prompt((notification: GoogleNotification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log("One Tap dialog not displayed:", notification.getNotDisplayedReason());
            }
          });
        }
        return true;
      } catch (error) {
        const err = error as Error;
        console.error("Failed to initialize Google Sign-In:", err);
        setError(`Failed to initialize Google Sign-In: ${err.message}`);
        return false;
      }
    },
    [handleGoogleSignIn]
  );

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    let initialized = false;

    console.log("Environment variables:", {
      VITE_GOOGLE_CLIENT_ID: clientId,
      PROD: import.meta.env.PROD,
      BASE_URL: import.meta.env.BASE_URL,
      MODE: import.meta.env.MODE
    });
    
    if (!clientId) {
      console.error("Google Client ID not configured");
      setError("Google Client ID not configured");
      return;
    }

    // Debug information
    console.log("Debug Info for Google Sign-In:");
    console.log("Current origin:", window.location.origin);
    console.log("Client ID:", clientId);
    console.log("Hostname:", window.location.hostname);
    console.log("Protocol:", window.location.protocol);
    console.log("Full URL:", window.location.href);

    let scriptEl = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
    let isNewScript = false;

    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.src = "https://accounts.google.com/gsi/client";
      scriptEl.async = true;
      scriptEl.defer = true;
      isNewScript = true;
    }
    
    const handleLoad = () => {
      if (!initializeGoogleSignIn(clientId)) {
        setError("Failed to initialize Google Sign-In");
      }
    };

    const handleError = () => {
      console.error("Failed to load Google Sign-In script");
      setError("Failed to load Google Sign-In");
    };

    scriptEl.addEventListener("load", handleLoad);
    scriptEl.addEventListener("error", handleError);

    if (isNewScript) {
      document.head.appendChild(scriptEl);
    } else if (window.google?.accounts?.id) {
      // Script already loaded, initialize directly
      handleLoad();
    }

    return () => {
      if (scriptEl) {
        scriptEl.removeEventListener("load", handleLoad);
        scriptEl.removeEventListener("error", handleError);
        if (isNewScript) {
          scriptEl.remove();
        }
      }
    };
  }, [initializeGoogleSignIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md magical-border backdrop-blur">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 genie-gradient rounded-full flex items-center justify-center glow-effect">
              <i className="fas fa-magic text-primary-foreground"></i>
            </div>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-center mb-2">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            {isSignup ? "Start your MindBloom journey" : "Sign in to continue"}
          </p>
          
          {/* Google Sign In Button */}
          <div id="googleSignIn" className="w-full mb-2"></div>
          <p className="text-center text-sm text-muted-foreground mb-4">
            Note: If sign in with Google fails, please create and sign in manually with email
          </p>
          
          <div className="relative flex items-center justify-center text-sm my-8">
            <span className="px-2 bg-background text-muted-foreground">or continue with email</span>
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
          </div>
          
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded border bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded border bg-background"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (isSignup ? "Creating…" : "Signing in…") : (isSignup ? "Create account" : "Sign in")}
            </Button>
          </form>
          
          <p className="text-center text-sm mt-6">
            {isSignup ? "Already have an account?" : "New here?"} {" "}
            <button 
              type="button"
              className="underline hover:text-primary transition-colors" 
              onClick={() => setIsSignup((v) => !v)}
            >
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}