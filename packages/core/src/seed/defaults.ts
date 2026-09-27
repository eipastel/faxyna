import type { Room, Settings } from '../domain/types';

/** Initial data for a new house. */
export const DEFAULT_ROOMS: Room[] = [
  { id: 'escritorio', name: 'Escritório', icon: 'desk', hue: 250 },
  { id: 'quarto', name: 'Quarto', icon: 'bed', hue: 300 },
  { id: 'sala', name: 'Sala', icon: 'weekend', hue: 70 },
  { id: 'cozinha', name: 'Cozinha', icon: 'kitchen', hue: 25 },
  { id: 'banheiro', name: 'Banheiro', icon: 'bathtub', hue: 205 },
  { id: 'lavanderia', name: 'Lavanderia', icon: 'local_laundry_service', hue: 150 },
];

export const DEFAULT_SETTINGS: Settings = { weekStartsMonday: true, showDoneToday: true };
