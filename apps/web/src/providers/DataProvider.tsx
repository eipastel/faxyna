'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { todayIso, type IsoDate, type Person, type Room, type Settings, type Task } from '@faxyna/core';
import { useGateway } from './GatewayProvider';

interface Data {
  tasks: Task[];
  rooms: Room[];
  people: Person[];
  settings: Settings;
  today: IsoDate;
  room(id: string): Room | undefined;
  person(id: string | null): Person | undefined;
}

const DataContext = createContext<Data | null>(null);

/** Today in the local timezone; updates itself when the day rolls over. */
function useToday(): IsoDate {
  const [today, setToday] = useState(todayIso);
  useEffect(() => {
    const id = setInterval(() => setToday(todayIso()), 60_000);
    return () => clearInterval(id);
  }, []);
  return today;
}

/** Subscribes to every gateway resource; renders children only once everything has arrived. */
export function DataProvider({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const gateway = useGateway();
  const today = useToday();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const subs = [
      gateway.tasks.subscribe(setTasks),
      gateway.rooms.subscribe(setRooms),
      gateway.people.subscribe(setPeople),
      gateway.settings.subscribe(setSettings),
    ];
    return () => subs.forEach((unsubscribe) => unsubscribe());
  }, [gateway]);

  const value = useMemo<Data | null>(() => {
    if (!tasks || !rooms || !people || !settings) return null;
    return {
      tasks, rooms, people, settings, today,
      room: (id) => rooms.find((r) => r.id === id),
      person: (id) => people.find((p) => p.id === id),
    };
  }, [tasks, rooms, people, settings, today]);

  if (!value) return fallback;
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): Data {
  const data = useContext(DataContext);
  if (!data) throw new Error('useData precisa estar dentro de <DataProvider>');
  return data;
}
