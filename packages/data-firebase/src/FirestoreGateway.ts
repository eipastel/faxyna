import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc, writeBatch, type Firestore } from 'firebase/firestore';
import {
  DEFAULT_SETTINGS, type DataGateway, type Person, type ReadRepository, type Room, type Settings,
  type SettingsRepository, type Task, type TaskRepository,
} from '@faxyna/core';
import { houseRef, toPeople, type HouseDoc } from './houses';

/** Read-only view over one field of the house document. */
function houseField<T>(db: Firestore, houseId: string, pick: (h: HouseDoc) => T[]): ReadRepository<T> {
  const ref = houseRef(db, houseId);
  return {
    list: async () => pick((await getDoc(ref)).data() as HouseDoc),
    subscribe: (listener) => onSnapshot(ref, (s) => s.exists() && listener(pick(s.data() as HouseDoc))),
  };
}

/** Gateway scoped to one house. */
export class FirestoreGateway implements DataGateway {
  tasks: TaskRepository;
  rooms: ReadRepository<Room>;
  people: ReadRepository<Person>;
  settings: SettingsRepository;

  constructor(db: Firestore, houseId: string) {
    const house = houseRef(db, houseId);
    const tasks = collection(db, 'houses', houseId, 'tasks');
    const withDefaults = (h: HouseDoc) => ({ ...DEFAULT_SETTINGS, ...h.settings });

    this.tasks = {
      list: async () => (await getDocs(tasks)).docs.map((d) => d.data() as Task),
      subscribe: (listener) => onSnapshot(tasks, (s) => listener(s.docs.map((d) => d.data() as Task))),
      save: (task) => setDoc(doc(tasks, task.id), task),
      async saveMany(list) {
        const batch = writeBatch(db);
        list.forEach((t) => batch.set(doc(tasks, t.id), t));
        await batch.commit();
      },
      remove: (id) => deleteDoc(doc(tasks, id)),
    };
    this.rooms = houseField(db, houseId, (h) => h.rooms);
    this.people = houseField(db, houseId, toPeople);
    this.settings = {
      get: async () => withDefaults((await getDoc(house)).data() as HouseDoc),
      save: (settings: Settings) => updateDoc(house, { settings }),
      subscribe: (listener) => onSnapshot(house, (s) => s.exists() && listener(withDefaults(s.data() as HouseDoc))),
    };
  }
}
