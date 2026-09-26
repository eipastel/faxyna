import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut,
} from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Web config is public by design; access is enforced by firestore.rules.
const config = {
  apiKey: 'AIzaSyCzkiJix2is3t4MztejzfaisOK2kSkQQ84',
  authDomain: 'faxyna-app.firebaseapp.com',
  projectId: 'faxyna-app',
  storageBucket: 'faxyna-app.firebasestorage.app',
  messagingSenderId: '853776901754',
  appId: '1:853776901754:web:b34f52cd1e467ffaf17dc3',
};

let instance: ReturnType<typeof init> | undefined;

function init() {
  const app = initializeApp(config);
  return {
    auth: getAuth(app),
    // IndexedDB cache keeps the installed app usable offline; undefined fields
    // (e.g. optional history data) are dropped instead of rejected.
    db: initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    }),
  };
}

/** Lazy so nothing runs during the static prerender. Browser only. */
export const firebase = () => (instance ??= init());

export const signIn = () => signInWithPopup(firebase().auth, new GoogleAuthProvider());
export const signInWithEmail = (email: string, password: string) => signInWithEmailAndPassword(firebase().auth, email, password);
// No email verification: invites still require a verified email (see firestore.rules).
export const createAccount = (email: string, password: string) => createUserWithEmailAndPassword(firebase().auth, email, password);
export const signOutUser = () => signOut(firebase().auth);
