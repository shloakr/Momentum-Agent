import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./config";

const googleProvider = new GoogleAuthProvider();

// Add scopes for Google Calendar access
googleProvider.addScope("https://www.googleapis.com/auth/calendar");
googleProvider.addScope("https://www.googleapis.com/auth/calendar.events");

export async function signInWithGoogle() {
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get the Google Access Token for API calls
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    
    // Store the access token for later use with Google Calendar API
    if (accessToken) {
      localStorage.setItem("google_access_token", accessToken);
    }
    
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function signInWithGoogleRedirect() {
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error("Error signing in with Google redirect:", error);
    throw error;
  }
}

export async function signOut() {
  if (!auth || !isFirebaseConfigured) {
    localStorage.removeItem("google_access_token");
    return;
  }
  try {
    localStorage.removeItem("google_access_token");
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!auth || !isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { auth };

