import { beforeEach, describe, expect, it } from 'vitest';

import { leisureDb, resetLeisureDb } from './leisureMockDb';
import { noteService } from './noteService';

describe('noteService', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('lists every note', async () => {
    expect((await noteService.getNotes()).length).toBeGreaterThan(0);
  });

  it('creates a note', async () => {
    const note = await noteService.createNote({ content: 'Nova nota', type: 'text', tags: [] });
    expect(note.pinned).toBe(false);
    expect(note.archived).toBe(false);
  });

  it('updates a note', async () => {
    const note = await noteService.createNote({ content: 'Nova nota', type: 'text', tags: [] });
    const updated = await noteService.updateNote(note.id, { content: 'Editada' });
    expect(updated?.content).toBe('Editada');
  });

  it('archives a note without deleting it', async () => {
    const note = await noteService.createNote({ content: 'Nova nota', type: 'text', tags: [] });
    const archived = await noteService.archiveNote(note.id);
    expect(archived?.archived).toBe(true);
    expect(await noteService.getNote(note.id)).not.toBeNull();
  });

  it('deletes a note', async () => {
    const note = await noteService.createNote({ content: 'Nova nota', type: 'text', tags: [] });
    await noteService.deleteNote(note.id);
    expect(await noteService.getNote(note.id)).toBeNull();
  });

  it('toggles pin on and off', async () => {
    const note = await noteService.createNote({ content: 'Nova nota', type: 'text', tags: [] });
    expect((await noteService.togglePin(note.id))?.pinned).toBe(true);
    expect((await noteService.togglePin(note.id))?.pinned).toBe(false);
  });

  it('toggles a checklist item', async () => {
    const note = leisureDb.notes.find((entry) => entry.type === 'checklist')!;
    const item = note.checklistItems!.find((entry) => !entry.checked)!;
    const updated = await noteService.toggleChecklistItem(note.id, item.id);
    expect(updated?.checklistItems?.find((entry) => entry.id === item.id)?.checked).toBe(true);
  });
});
