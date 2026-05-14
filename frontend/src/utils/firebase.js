import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDv0zwDpi3ZW0p501AX9D1BCXfrf5nQ9f0",
  authDomain: "interviewiq-626b7.firebaseapp.com",
  projectId: "interviewiq-626b7",
  storageBucket: "interviewiq-626b7.appspot.com",
  messagingSenderId: "361200002179",
  appId: "1:361200002179:web:69adda75bf0960d26027b6",
  measurementId: "G-KE4173TSD3"
};

// Disable Firebase Auth emulator and iframe
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Disable the auth iframe that causes COOP issues
auth.useDeviceLanguage();

const googleProvider = new GoogleAuthProvider();
// Remove any extra scopes to keep it simple
googleProvider.setCustomParameters({
  prompt: 'consent select_account'
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const idToken = await result.user.getIdToken()
    return idToken
  } catch (error) {
    // Log only to console, don't throw for expected errors
    console.log('Google sign in error:', error.code)
    throw error
  }
}

export const logout = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.log('Sign out error:', error)
  }
}

export { auth }