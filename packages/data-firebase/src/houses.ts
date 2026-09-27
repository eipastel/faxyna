import {
  arrayRemove, arrayUnion, collection, deleteField, doc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc,
  where, writeBatch,
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
// back until the write is acknowledged; any other pending write (an edit, even offline)
// never hides a house.
const settling = new Set<string>();
/** Open watchHouses listeners, re-run once a house settles. */
const refreshers = new Set<() => void>();

async function settle(houseId: string, write: Promise<void>) {
  settling.add(houseId);
  try {
    await write;
  } finally {
    settling.delete(houseId);
    refreshers.forEach((refresh) => refresh());
  }
}

export function watchHouses(
  db: Firestore,
  user: Member,
  listener: (houses: { mine: House[]; invites: House[] }) => void,
): Unsubscribe {
  const houses = collection(db, 'houses');
  let mine: House[] | null = null;
  let invites: House[] | null = user.emailVerified ? null : [];
  const emit = () => mine && invites && listener({ mine, invites });
  let memberDocs: QueryDocumentSnapshot[] | null = null;
  const refresh = () => {
    if (!memberDocs) return;
    mine = toHouses(memberDocs.filter((d) => !settling.has(d.id)));
    emit();
  };
  refreshers.add(refresh);
  const subs = [
    onSnapshot(query(houses, where('memberUids', 'array-contains', user.uid)), { includeMetadataChanges: true }, (s) => {
      memberDocs = s.docs;
      refresh();
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
  return () => {
    refreshers.delete(refresh);
    subs.forEach((unsubscribe) => unsubscribe());
  };
}

export async function createHouse(db: Firestore, user: Member, name: string): Promise<string> {
  const ref = doc(collection(db, 'houses'));
  await settle(ref.id, setDoc(ref, {
    name,
    ownerUid: user.uid,
    memberUids: [user.uid],
    invites: [],
    people: { [user.uid]: { name: user.name, joinedAt: Date.now() } },
    rooms: DEFAULT_ROOMS,
    settings: DEFAULT_SETTINGS,
    createdAt: serverTimestamp(),
  }));
  return ref.id;
}

export const joinHouse = (db: Firestore, houseId: string, user: Member) =>
  settle(houseId, updateDoc(houseRef(db, houseId), {
    memberUids: arrayUnion(user.uid),
    invites: arrayRemove(user.email.toLowerCase()),
    [`people.${user.uid}`]: { name: user.name, joinedAt: Date.now() },
  }));

/**
 * Accepts an invite while already living in a house: joins the new house, then
 * leaves the current one. As its last member, the current house is deleted with its tasks.
 */
export async function moveToHouse(db: Firestore, from: House, toId: string, user: Member) {
  await joinHouse(db, toId, user);
  const ref = houseRef(db, from.id);
  if (from.memberUids.length > 1) {
    await updateDoc(ref, { memberUids: arrayRemove(user.uid), [`people.${user.uid}`]: deleteField() });
    return;
  }
  // ponytail: one batch holds 500 writes; chunk it if a house ever has more tasks.
  const batch = writeBatch(db);
  (await getDocs(collection(ref, 'tasks'))).forEach((t) => batch.delete(t.ref));
  batch.delete(ref);
  await batch.commit();
}

export const inviteToHouse = (db: Firestore, houseId: string, email: string) =>
  updateDoc(houseRef(db, houseId), { invites: arrayUnion(email.trim().toLowerCase()) });

export const cancelInvite = (db: Firestore, houseId: string, email: string) =>
  updateDoc(houseRef(db, houseId), { invites: arrayRemove(email) });
