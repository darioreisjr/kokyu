import { ApiError } from '@/lib/api/errors';
import { generateId, leisureDb } from '@/features/leisure/services/leisureMockDb';

/**
 * A fake kokyu-sam backend for `/leisure/*` routes, used only by tests
 * (installed globally in test/setup.ts). The real app never imports this —
 * `src/features/leisure/services/*.ts` call the real `apiFetchClient`
 * against the real backend. This exists so the large existing suite of
 * hook/page tests (written against `leisureMockDb`'s in-memory store,
 * asserting on the fixture titles in `mocks/*.mock.ts`) keeps working
 * without every one of them individually mocking every endpoint response —
 * the same role an MSW handler set would play, just hand-rolled to match
 * this repo's existing "one shared in-memory store" test fixture pattern.
 *
 * Mirrors the real Nest leisure module's request/response shapes closely
 * enough for these tests (id generation, 404 semantics via ApiError,
 * shallow-merge PATCH semantics), but is not a full reimplementation of
 * every validation rule the real backend enforces - it is a UI test double,
 * not a backend test.
 */

interface RequestInit {
  method?: string;
  body?: unknown;
}

function notFound(): never {
  throw new ApiError(404, { status: 404, code: 'NOT_FOUND', detail: 'Not found' }, 'Not found');
}

function parse(path: string): { segments: string[]; query: URLSearchParams } {
  const [pathname, search = ''] = path.split('?');
  const segments = pathname!.split('/').filter(Boolean);
  return { segments, query: new URLSearchParams(search) };
}

export async function mockLeisureApiFetchClient(path: string, init: RequestInit = {}): Promise<unknown> {
  const { segments, query } = parse(path);
  const method = (init.method ?? 'GET').toUpperCase();
  // segments[0] === 'leisure'
  const resource = segments[1];

  if (resource === 'items') return handleItems(segments, query, method, init.body);
  if (resource === 'plan') return handlePlan(segments, query, method, init.body);
  if (resource === 'history') return handleHistory(segments, method, init.body);
  if (resource === 'notes') return handleNotes(segments, method, init.body);
  if (resource === 'collections') return handleCollections(segments, method, init.body);
  if (resource === 'summary') return handleSummary(query);

  throw new Error(`mockLeisureApiFetchClient: unhandled path "${path}"`);
}

// --- summary (Home) ---------------------------------------------------------

function handleSummary(query: URLSearchParams): unknown {
  const date = query.get('date') ?? '';
  const itemById = new Map(leisureDb.items.map((item) => [item.id, item]));

  const plannedEntry = [...leisureDb.planEntries]
    .filter((entry) => entry.date === date && !entry.completed)
    .sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99'))[0];

  const inProgressItem = leisureDb.items.find((item) => item.status === 'inProgress');

  return {
    plannedToday: plannedEntry
      ? {
          id: plannedEntry.id,
          title: plannedEntry.title,
          type: plannedEntry.leisureItemId ? (itemById.get(plannedEntry.leisureItemId)?.type ?? 'custom') : 'custom',
          startTime: plannedEntry.startTime ?? null,
        }
      : null,
    inProgress: inProgressItem
      ? { id: inProgressItem.id, title: inProgressItem.title, type: inProgressItem.type }
      : null,
    backlogCount: leisureDb.items.filter((item) => item.type === 'unsorted').length,
  };
}

// --- items -------------------------------------------------------------

function handleItems(
  segments: string[],
  _query: URLSearchParams,
  method: string,
  body: unknown,
): unknown {
  const id = segments[2];
  const sub = segments[3];

  if (id === 'covers' && sub === 'upload-url' && method === 'POST') {
    return {
      path: `mock-user/${generateId('cover')}.png`,
      token: 'mock-token',
      signedUrl: 'https://mock-storage.test/upload',
    };
  }

  if (!id) {
    if (method === 'GET') return [...leisureDb.items];
    if (method === 'POST') {
      const now = new Date().toISOString();
      const input = body as Record<string, unknown>;
      const item = { ...input, id: generateId('leisure'), createdAt: now, updatedAt: now };
      leisureDb.items.push(item as (typeof leisureDb.items)[number]);
      return item;
    }
  }

  const index = leisureDb.items.findIndex((item) => item.id === id);

  if (sub === 'favorite' && method === 'POST') {
    if (index === -1) notFound();
    const existing = leisureDb.items[index]!;
    const updated = { ...existing, favorite: !existing.favorite, updatedAt: new Date().toISOString() };
    leisureDb.items[index] = updated;
    return updated;
  }

  if (sub === 'archive' && method === 'POST') {
    if (index === -1) notFound();
    const existing = leisureDb.items[index]!;
    const updated = {
      ...existing,
      status: 'archived',
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as (typeof leisureDb.items)[number];
    leisureDb.items[index] = updated;
    return updated;
  }

  if (sub === 'progress' && method === 'PATCH') {
    if (index === -1) notFound();
    const existing = leisureDb.items[index]!;
    const patch = (body as { progress: Record<string, unknown> }).progress;
    const existingSlice = (existing as unknown as Record<string, unknown>)[existing.type];
    const updated = {
      ...existing,
      [existing.type]: {
        ...(typeof existingSlice === 'object' && existingSlice ? existingSlice : {}),
        ...patch,
      },
      updatedAt: new Date().toISOString(),
    };
    leisureDb.items[index] = updated;
    return updated;
  }

  if (sub === 'reclassify' && method === 'POST') {
    if (index === -1) notFound();
    const existing = leisureDb.items[index]!;
    const { type: newType, details } = body as { type: string; details: Record<string, unknown> };
    const rest = { ...(existing as unknown as Record<string, unknown>) };
    delete rest[existing.type];
    const updated = {
      ...rest,
      type: newType,
      [newType]: details,
      updatedAt: new Date().toISOString(),
    } as unknown as (typeof leisureDb.items)[number];
    leisureDb.items[index] = updated;
    return updated;
  }

  if (!sub) {
    if (method === 'GET') {
      if (index === -1) notFound();
      return leisureDb.items[index];
    }
    if (method === 'PATCH') {
      if (index === -1) notFound();
      const existing = leisureDb.items[index]!;
      const updated = { ...existing, ...(body as Record<string, unknown>), updatedAt: new Date().toISOString() };
      leisureDb.items[index] = updated as (typeof leisureDb.items)[number];
      return updated;
    }
    if (method === 'DELETE') {
      leisureDb.items = leisureDb.items.filter((item) => item.id !== id);
      return undefined;
    }
  }

  throw new Error(`mockLeisureApiFetchClient: unhandled items route ${method} ${segments.join('/')}`);
}

// --- plan ----------------------------------------------------------------

function handlePlan(
  segments: string[],
  query: URLSearchParams,
  method: string,
  body: unknown,
): unknown {
  const id = segments[2];
  const sub = segments[3];

  if (!id) {
    if (method === 'GET') {
      const startDate = query.get('startDate') ?? '';
      const endDate = query.get('endDate') ?? '';
      return leisureDb.planEntries.filter((entry) => entry.date >= startDate && entry.date <= endDate);
    }
    if (method === 'POST') {
      const entry = {
        id: generateId('plan'),
        completed: false,
        createdAt: new Date().toISOString(),
        ...(body as Record<string, unknown>),
      };
      leisureDb.planEntries.push(entry as (typeof leisureDb.planEntries)[number]);
      return entry;
    }
  }

  const index = leisureDb.planEntries.findIndex((entry) => entry.id === id);

  if (sub === 'complete' && method === 'POST') {
    if (index === -1) notFound();
    const updated = { ...leisureDb.planEntries[index]!, completed: true };
    leisureDb.planEntries[index] = updated;
    return updated;
  }

  if (!sub) {
    if (method === 'PATCH') {
      if (index === -1) notFound();
      const updated = { ...leisureDb.planEntries[index]!, ...(body as Record<string, unknown>) };
      leisureDb.planEntries[index] = updated as (typeof leisureDb.planEntries)[number];
      return updated;
    }
    if (method === 'DELETE') {
      leisureDb.planEntries = leisureDb.planEntries.filter((entry) => entry.id !== id);
      return undefined;
    }
  }

  throw new Error(`mockLeisureApiFetchClient: unhandled plan route ${method} ${segments.join('/')}`);
}

// --- history ---------------------------------------------------------------

function handleHistory(segments: string[], method: string, body: unknown): unknown {
  if (segments.length === 2) {
    if (method === 'GET') {
      return [...leisureDb.logEntries].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
    }
    if (method === 'POST') {
      const entry = {
        id: generateId('log'),
        createdAt: new Date().toISOString(),
        ...(body as Record<string, unknown>),
      };
      leisureDb.logEntries.push(entry as (typeof leisureDb.logEntries)[number]);
      return entry;
    }
  }

  throw new Error(`mockLeisureApiFetchClient: unhandled history route ${method} ${segments.join('/')}`);
}

// --- notes -----------------------------------------------------------------

function handleNotes(segments: string[], method: string, body: unknown): unknown {
  const id = segments[2];
  const sub = segments[3];
  const checklistItemId = segments[4];

  if (!id) {
    if (method === 'GET') return [...leisureDb.notes];
    if (method === 'POST') {
      const now = new Date().toISOString();
      const note = {
        id: generateId('note'),
        pinned: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
        ...(body as Record<string, unknown>),
      };
      leisureDb.notes.push(note as (typeof leisureDb.notes)[number]);
      return note;
    }
  }

  const index = leisureDb.notes.findIndex((note) => note.id === id);

  if (sub === 'pin' && method === 'POST') {
    if (index === -1) notFound();
    const existing = leisureDb.notes[index]!;
    const updated = { ...existing, pinned: !existing.pinned, updatedAt: new Date().toISOString() };
    leisureDb.notes[index] = updated;
    return updated;
  }

  if (sub === 'archive' && method === 'POST') {
    if (index === -1) notFound();
    const updated = { ...leisureDb.notes[index]!, archived: true, updatedAt: new Date().toISOString() };
    leisureDb.notes[index] = updated;
    return updated;
  }

  if (sub === 'checklist' && method === 'PATCH') {
    if (index === -1) notFound();
    const existing = leisureDb.notes[index]!;
    const updated = {
      ...existing,
      checklistItems: existing.checklistItems?.map((entry) =>
        entry.id === checklistItemId ? { ...entry, checked: !entry.checked } : entry,
      ),
      updatedAt: new Date().toISOString(),
    };
    leisureDb.notes[index] = updated;
    return updated;
  }

  if (!sub) {
    if (method === 'GET') {
      if (index === -1) notFound();
      return leisureDb.notes[index];
    }
    if (method === 'PATCH') {
      if (index === -1) notFound();
      const updated = { ...leisureDb.notes[index]!, ...(body as Record<string, unknown>), updatedAt: new Date().toISOString() };
      leisureDb.notes[index] = updated as (typeof leisureDb.notes)[number];
      return updated;
    }
    if (method === 'DELETE') {
      leisureDb.notes = leisureDb.notes.filter((note) => note.id !== id);
      return undefined;
    }
  }

  throw new Error(`mockLeisureApiFetchClient: unhandled notes route ${method} ${segments.join('/')}`);
}

// --- collections -------------------------------------------------------------

function handleCollections(segments: string[], method: string, body: unknown): unknown {
  const id = segments[2];
  const sub = segments[3];
  const itemId = segments[4];

  if (!id) {
    if (method === 'GET') return [...leisureDb.collections];
    if (method === 'POST') {
      const now = new Date().toISOString();
      const input = body as { name: string; description?: string; itemIds?: string[] };
      const collection = {
        id: generateId('collection'),
        name: input.name,
        description: input.description,
        itemIds: input.itemIds ?? [],
        createdAt: now,
        updatedAt: now,
      };
      leisureDb.collections.push(collection);
      return collection;
    }
  }

  const index = leisureDb.collections.findIndex((collection) => collection.id === id);

  if (sub === 'items') {
    if (index === -1) notFound();
    const existing = leisureDb.collections[index]!;

    if (method === 'POST') {
      const targetId = (body as { itemId: string }).itemId;
      if (existing.itemIds.includes(targetId)) return existing;
      const updated = {
        ...existing,
        itemIds: [...existing.itemIds, targetId],
        updatedAt: new Date().toISOString(),
      };
      leisureDb.collections[index] = updated;
      return updated;
    }

    if (method === 'DELETE') {
      const updated = {
        ...existing,
        itemIds: existing.itemIds.filter((entry) => entry !== itemId),
        updatedAt: new Date().toISOString(),
      };
      leisureDb.collections[index] = updated;
      return updated;
    }
  }

  if (!sub) {
    if (method === 'GET') {
      if (index === -1) notFound();
      return leisureDb.collections[index];
    }
    if (method === 'DELETE') {
      leisureDb.collections = leisureDb.collections.filter((collection) => collection.id !== id);
      return undefined;
    }
  }

  throw new Error(
    `mockLeisureApiFetchClient: unhandled collections route ${method} ${segments.join('/')}`,
  );
}
