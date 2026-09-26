'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup,
  signOut, type User,
} from 'firebase/auth';
import { FirestoreGateway, watchHouses, type House, type Member } from '@faxyna/data-firebase';
import { SplashDismiss } from '@/components/layout/Splash';
import { HouseSetupScreen, SignInScreen } from '@/features/session/SessionScreens';
import { firebase } from '@/lib/firebase';
import { GatewayProvider } from './GatewayProvider';

interface Session {
  member: Member;
  house: House;
  signOut(): void;
}

const SessionContext = createContext<Session | null>(null);

const toMember = (u: User): Member => ({
  uid: u.uid,
  email: u.email ?? '',
  emailVerified: u.emailVerified,
  name: u.displayName?.split(' ')[0] || u.email?.split('@')[0] || 'Eu',
});

export const signOutUser = () => signOut(firebase().auth);
export const signIn = () => signInWithPopup(firebase().auth, new GoogleAuthProvider());
export const signInWithEmail = (email: string, password: string) => signInWithEmailAndPassword(firebase().auth, email, password);
// No email verification: invites still require a verified email (see firestore.rules).
export const createAccount = (email: string, password: string) => createUserWithEmailAndPassword(firebase().auth, email, password);

/**
 * Auth + house gate: sign-in screen, then create/join a house, then the app
 * with a gateway scoped to that house. Returns nothing while resolving, so the splash stays up.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [houses, setHouses] = useState<{ mine: House[]; invites: House[] } | null>(null);

  useEffect(() => onAuthStateChanged(firebase().auth, setUser), []);
  useEffect(() => {
    setHouses(null);
    if (user) return watchHouses(firebase().db, toMember(user), setHouses);
  }, [user]);

  // ponytail: first house only; add a house switcher if someone ever has two.
  const house = houses?.mine[0];
  const houseId = house?.id;
  const gateway = useMemo(() => houseId && new FirestoreGateway(firebase().db, houseId), [houseId]);

  if (user === undefined || (user && !houses)) return null;
  if (!user) return <><SplashDismiss /><SignInScreen /></>;
  const member = toMember(user);
  if (!house || !gateway) return <><SplashDismiss /><HouseSetupScreen member={member} invites={houses!.invites} /></>;

  return (
    <SessionContext.Provider value={{ member, house, signOut: signOutUser }}>
      <GatewayProvider gateway={gateway}>{children}</GatewayProvider>
    </SessionContext.Provider>
  );
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession precisa estar dentro de <SessionProvider>');
  return session;
}
