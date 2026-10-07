// Saved games, in the browser instead of .JIM files: three named slots, plus an autosave
// made every time Jimmy changes room (so a closed tab can be resumed). A save holds the
// same fields the original wrote to a .JIM file.

export interface Save {
  name: string;
  savedAt: number;
  roomnum: number;
  points: number;
  jt: number;
  ja: number;
  jd: number;
  jhp: number;
  maxhp: number;
  jmp: number;
  maxmp: number;
  money: number;
  lev: number;
  nexp: number;
  magic: number;
  weapon: number;
  jex: number;
  armor: number;
  shield: number;
  ittoms: number[];
  /** New-content progress (absent in saves made before it existed). */
  story?: Story;
}

/** Progress through the new content (J7). */
export interface Story {
  /** 0 = hasn't got in, 1 = got in (won the number game), 2 = learned Blind. */
  hermit: number;
  /** The mayor's pass to Bob's gate. */
  pass: number;
  /** Through Bob's gate (with the pass, or past the captain). */
  gate: number;
  /** Raided the camp's supply tent. */
  supplies: number;
  /** Won the Colosseum's grand prize. */
  prize: number;
}

export const newStory = (): Story => ({ hermit: 0, pass: 0, gate: 0, supplies: 0, prize: 0 });

interface Store {
  v: 1;
  auto: Save | null;
  slots: (Save | null)[];
}

const KEY = 'pnp.jimmyx.v1';
export const SLOTS = 3;

function read(): Store {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Store | null;
    if (s && s.v === 1) return { ...s, slots: Array.from({ length: SLOTS }, (_, i) => s.slots[i] ?? null) };
  } catch {}
  return { v: 1, auto: null, slots: Array(SLOTS).fill(null) };
}

function write(s: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export const saves = {
  slots: (): (Save | null)[] => read().slots,
  auto: (): Save | null => read().auto,
  putSlot(i: number, save: Save): void {
    const s = read();
    s.slots[i] = save;
    write(s);
  },
  putAuto(save: Save | null): void {
    const s = read();
    s.auto = save;
    write(s);
  },
};
