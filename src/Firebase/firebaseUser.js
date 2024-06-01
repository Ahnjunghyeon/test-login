import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      const googleName = user.displayName;
      if (googleName) {
        return updateProfile(user, { displayName: googleName })
          .then(() => user)
          .catch((error) => {
            console.error("Failed to update profile with Google name:", error);
            throw error;
          });
      }
      return user;
    })
    .catch((error) => {
      console.error("Google sign-in failed:", error);
      throw error;
    });
};

export const signOutUser = () => {
  return auth.signOut();
};
