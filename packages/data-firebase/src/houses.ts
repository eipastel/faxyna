import {
  arrayRemove, arrayUnion, collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where,
  type Firestore, type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { DEFAULT_ROOMS, DEFAULT_SETTINGS, type Person, type Room, type Settings, type Unsubscribe } from '@faxyna/core';

/**
 * `houses/{id}`. Tasks live in `houses/{id}/tasks`. Access is enforced by
 * `firestore.rules`: members read and write, invited emails may only join.
 */
export interface HouseDoc {
  name: string;
  ownerUid: string;
  memberUids: string[];
  /** Lowercased emails invited to join. */
  invites: string[];
  /** Keyed by uid; a person's id is their uid. */
  people: Record<string, { name: string; joinedAt: number }>;
  rooms: Room[];
  settings: Settings;
}

export interface House extends HouseDoc {
  id: string;
}

export interface Member {
  uid: string;
  name: string;
  email: string;
  /** Invites are only readable with a verified email (see firestore.rules). */
  emailVerified: boolean;
}

export const houseRef = (db: Firestore, id: string) => doc(db, 'houses', id);

export const toPeople = (house: Pick<HouseDoc, 'people'>): Person[] =>
  Object.entries(house.people)
    .sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
    .map(([id, p]) => ({ id, name: p.name }));

const toHouses = (docs: QueryDocumentSnapshot[]) => docs.map((d) => ({ id: d.id, ...(d.data() as HouseDoc) }));

/** Houses the user belongs to and houses they were invited to, kept live. */
// Right after create/join the local cache shows the house before the server has
// committed it, when the rules would still refuse its tasks. Those houses are held
// back until confirmed; any other pending write (an edit, even offline) never hides a house.
const settling = new Set<string>();

export function watchHouses(
  db: Firestore,
  user: Member,
  listener: (houses: { mine: House[]; invites: House[] }) => void,
): Unsubscribe {
  const houses = collection(db, 'houses');
  const isReady = (d: QueryDocumentSnapshot) => {
    if (!d.metadata.hasPendingWrites) settling.delete(d.id);
    return !settling.has(d.id);
  };
  let mine: House[] | null = null;
  let invites: House[] | null = user.emailVerified ? null : [];
  const emit = () => mine && invites && listener({ mine, invites });
  const subs = [
    onSnapshot(query(houses, where('memberUids', 'array-contains', user.uid)), { includeMetadataChanges: true }, (s) => {
      mine = toHouses(s.docs.filter(isReady));
      emit();
    }),
  ];
  if (user.emailVerified) {
    const setInvites = (list: House[]) => {
      invites = list;
      emit();
    };
    // A failed invites query must not block the app: treat it as "no invites".
    subs.push(onSnapshot(query(houses, where('invites', 'array-contains', user.email.toLowerCase())), (s) => setInvites(toHouses(s.docs)), () => setInvites([])));
  }
  return () => subs.forEach((unsubscribe) => unsubscribe());
}

export async function createHouse(db: Firestore, user: Member, name: string): Promise<string> {
  const ref = doc(collection(db, 'houses'));
  settling.add(ref.id);
  await setDoc(ref, {
    name,
    ownerUid: user.uid,
    memberUids: [user.uid],
    invites: [],
    people: { [user.uid]: { name: user.name, joinedAt: Date.now() } },
    rooms: DEFAULT_ROOMS,
    settings: DEFAULT_SETTINGS,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function joinHouse(db: Firestore, houseId: string, user: Member) {
  settling.add(houseId);
  return updateDoc(houseRef(db, houseId), {
    memberUids: arrayUnion(user.uid),
    invites: arrayRemove(user.email.toLowerCase()),
    [`people.${user.uid}`]: { name: user.name, joinedAt: Date.now() },
  });
}

export const inviteToHouse = (db: Firestore, houseId: string, email: string) =>
  updateDoc(houseRef(db, houseId), { invites: arrayUnion(email.trim().toLowerCase()) });

export const cancelInvite = (db: Firestore, houseId: string, email: string) =>
  updateDoc(houseRef(db, houseId), { invites: arrayRemove(email) });
