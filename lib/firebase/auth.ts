import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./config";

const googleProvider = new GoogleAuthProvider();

// Add scopes for Google Calendar access
googleProvider.addScope("https://www.googleapis.com/auth/calendar");
googleProvider.addScope("https://www.googleapis.com/auth/calendar.events");

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error("Firebase auth not initialized");
  }
  const result = await signInWithPopup(auth, googleProvider);
  
  // Get the Google Access Token for API calls
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;
  
  // Store the access token for later use with Google Calendar API
  if (accessToken) {
    localStorage.setItem("google_access_token", accessToken);
  }
  
  return result.user;
}

export async function signInWithGoogleRedirect() {
  if (!auth) {
    throw new Error("Firebase auth not initialized");
  }
  await signInWithRedirect(auth, googleProvider);
}

export async function signOut() {
  localStorage.removeItem("google_access_token");
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { auth };

