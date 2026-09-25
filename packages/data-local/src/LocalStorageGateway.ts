import {
  DEFAULT_PEOPLE, DEFAULT_ROOMS, DEFAULT_SETTINGS,
  type DataGateway, type Person, type ReadRepository, type Room, type Settings,
  type SettingsRepository, type Task, type TaskRepository, type Unsubscribe,
} from '@faxyna/core';

const PREFIX = 'faxyna:v1:';

/**
 * A localStorage key holding a JSON value, seeded on first read, with change
 * notifications (in the same tab and across tabs via the `storage` event).
 */
class Store<T> {
  private listeners = new Set<(value: T) => void>();
  private key: string;

  constructor(name: string, private seed: () => T) {
    this.key = PREFIX + name;
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.key) this.emit();
      });
    }
  }

  read(): T {
    const raw = localStorage.getItem(this.key);
    if (raw !== null) {
      try {
        return JSON.parse(raw) as T;
      } catch {
        // Corrupted JSON: fall back to the seed below.
      }
    }
    const value = this.seed();
    localStorage.setItem(this.key, JSON.stringify(value));
    return value;
  }

  write(value: T) {
    localStorage.setItem(this.key, JSON.stringify(value));
    this.emit();
  }

  subscribe(listener: (value: T) => void): Unsubscribe {
    this.listeners.add(listener);
    listener(this.read());
    return () => this.listeners.delete(listener);
  }

  private emit() {
    const value = this.read();
    this.listeners.forEach((l) => l(value));
  }
}

const readOnly = <T>(store: Store<T[]>): ReadRepository<T> => ({
  list: async () => store.read(),
  subscribe: (l) => store.subscribe(l),
});

class LocalTaskRepository implements TaskRepository {
  constructor(private store: Store<Task[]>) {}

  list = async () => this.store.read();
  subscribe = (l: (items: Task[]) => void) => this.store.subscribe(l);

  async save(task: Task) {
    await this.saveMany([task]);
  }

  async saveMany(tasks: Task[]) {
    const byId = new Map(this.store.read().map((t) => [t.id, t]));
    tasks.forEach((t) => byId.set(t.id, t));
    this.store.write([...byId.values()]);
  }

  async remove(id: string) {
    this.store.write(this.store.read().filter((t) => t.id !== id));
  }
}

class LocalSettingsRepository implements SettingsRepository {
  constructor(private store: Store<Settings>) {}

  get = async () => ({ ...DEFAULT_SETTINGS, ...this.store.read() });
  save = async (s: Settings) => this.store.write(s);
  subscribe = (l: (s: Settings) => void) => this.store.subscribe((s) => l({ ...DEFAULT_SETTINGS, ...s }));
}

export class LocalStorageGateway implements DataGateway {
  tasks = new LocalTaskRepository(new Store<Task[]>('tasks', () => []));
  rooms = readOnly(new Store<Room[]>('rooms', () => DEFAULT_ROOMS));
  people = readOnly(new Store<Person[]>('people', () => DEFAULT_PEOPLE));
  settings = new LocalSettingsRepository(new Store<Settings>('settings', () => DEFAULT_SETTINGS));
}
