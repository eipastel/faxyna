import type { Person, Room, Settings, Task } from '../domain/types';

export type Unsubscribe = () => void;

/**
 * Read-only collection. `subscribe` emits the current state right away and
 * then on every change (same contract as Firestore's `onSnapshot`).
 */
export interface ReadRepository<T> {
  list(): Promise<T[]>;
  subscribe(listener: (items: T[]) => void): Unsubscribe;
}

export interface TaskRepository extends ReadRepository<Task> {
  /** Creates or replaces the task with the same `id`. */
  save(task: Task): Promise<void>;
  saveMany(tasks: Task[]): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<Settings>;
  save(settings: Settings): Promise<void>;
  subscribe(listener: (settings: Settings) => void): Unsubscribe;
}

/**
 * The app's single data access point. The front end only knows this interface;
 * implementation: `@faxyna/data-firebase` (Firestore).
 */
export interface DataGateway {
  tasks: TaskRepository;
  rooms: ReadRepository<Room>;
  people: ReadRepository<Person>;
  settings: SettingsRepository;
}
