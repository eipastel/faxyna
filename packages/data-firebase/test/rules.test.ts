// Runs against the Firestore emulator: `pnpm test:rules` (needs Java 21+).
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteField, doc, getDoc, getDocs, query, setDoc, updateDoc, where, arrayUnion, arrayRemove } from 'firebase/firestore';
import { afterAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;
const OWNER = { uid: 'thiago', email: 'thiago@gmail.com' };
const GUEST = { uid: 'julia', email: 'julia@gmail.com' };
const STRANGER = { uid: 'zed', email: 'zed@gmail.com' };

const as = (u: { uid: string; email: string }) =>
  env.authenticatedContext(u.uid, { email: u.email, email_verified: true }).firestore();

const house = {
  name: 'Casa', ownerUid: OWNER.uid, memberUids: [OWNER.uid], invites: [GUEST.email],
  people: { [OWNER.uid]: { name: 'Thiago', joinedAt: 1 } }, rooms: [], settings: {},
};

beforeEach(async () => {
  env ??= await initializeTestEnvironment({
    projectId: 'demo-faxyna',
    firestore: { rules: readFileSync(new URL('../../../firestore.rules', import.meta.url), 'utf8') },
  });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'houses/h1'), house));
});
afterAll(() => env?.cleanup());

const join = (db: ReturnType<typeof as>, u: typeof GUEST) =>
  updateDoc(doc(db, 'houses/h1'), {
    memberUids: arrayUnion(u.uid),
    invites: arrayRemove(u.email),
    [`people.${u.uid}`]: { name: 'X', joinedAt: 2 },
  });

describe('houses', () => {
  it('creating your own house', async () => {
    await assertSucceeds(setDoc(doc(as(STRANGER), 'houses/h2'), { ...house, ownerUid: STRANGER.uid, memberUids: [STRANGER.uid], invites: [], people: { [STRANGER.uid]: { name: 'Z', joinedAt: 1 } } }));
    await assertFails(setDoc(doc(as(STRANGER), 'houses/h3'), { ...house, invites: [] }));
  });

  it('members and invited read (also via the app queries); strangers do not', async () => {
    await assertSucceeds(getDocs(query(collection(as(OWNER), 'houses'), where('memberUids', 'array-contains', OWNER.uid))));
    await assertSucceeds(getDocs(query(collection(as(GUEST), 'houses'), where('invites', 'array-contains', GUEST.email))));
    await assertFails(getDoc(doc(as(STRANGER), 'houses/h1')));
    const unverified = env.authenticatedContext(GUEST.uid, { email: GUEST.email, email_verified: false }).firestore();
    await assertFails(getDoc(doc(unverified, 'houses/h1')));
  });

  it('invited user joins only as themselves; strangers cannot join', async () => {
    await assertFails(join(as(STRANGER), STRANGER));
    await assertFails(updateDoc(doc(as(GUEST), 'houses/h1'), { name: 'Minha' }));
    await assertSucceeds(join(as(GUEST), GUEST));
  });

  it('members cannot change membership or ownership', async () => {
    await assertSucceeds(updateDoc(doc(as(OWNER), 'houses/h1'), { invites: arrayUnion('a@b.com') }));
    await assertFails(updateDoc(doc(as(OWNER), 'houses/h1'), { memberUids: arrayUnion(STRANGER.uid) }));
    await assertFails(updateDoc(doc(as(OWNER), 'houses/h1'), { ownerUid: STRANGER.uid, people: deleteField() }));
  });

  it('members edit only their own person entry', async () => {
    await assertSucceeds(join(as(GUEST), GUEST));
    await assertSucceeds(updateDoc(doc(as(OWNER), 'houses/h1'), { [`people.${OWNER.uid}.name`]: 'Thi' }));
    await assertFails(updateDoc(doc(as(OWNER), 'houses/h1'), { [`people.${GUEST.uid}`]: deleteField() }));
  });

  it('an invited member can still accept (clears the invite)', async () => {
    await assertSucceeds(join(as(GUEST), GUEST));
    await assertSucceeds(updateDoc(doc(as(OWNER), 'houses/h1'), { invites: arrayUnion(GUEST.email) }));
    await assertSucceeds(join(as(GUEST), GUEST));
  });

  it('tasks are members only', async () => {
    await assertSucceeds(setDoc(doc(as(OWNER), 'houses/h1/tasks/t1'), { name: 'Varrer' }));
    await assertFails(getDoc(doc(as(GUEST), 'houses/h1/tasks/t1')));
    await assertFails(setDoc(doc(as(STRANGER), 'houses/h1/tasks/t2'), { name: 'x' }));
  });
});
