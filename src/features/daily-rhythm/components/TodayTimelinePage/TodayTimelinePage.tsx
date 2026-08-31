'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type {
  FreeTimeSlot,
  ScheduleCandidate,
  ScheduleEntry,
  ScheduleEntryInput,
} from '@/shared/scheduling/types';
import { useDailyRhythm } from '../../hooks/useDailyRhythm';
import { useScheduleShortcuts } from '../../hooks/useScheduleShortcuts';
import { dailyRhythmService } from '../../services/dailyRhythmService';
import { CapacityIndicator } from '../CapacityIndicator/CapacityIndicator';
import { ConflictBanner } from '../ConflictBanner/ConflictBanner';
import { DailyPlanningDialog } from '../DailyPlanningDialog/DailyPlanningDialog';
import { DailyRhythmHeader } from '../DailyRhythmHeader/DailyRhythmHeader';
import { DailyTimeline } from '../DailyTimeline/DailyTimeline';
import { ReplanDialog } from '../ReplanDialog/ReplanDialog';
import { ScheduleEntryModal } from '../ScheduleEntryModal/ScheduleEntryModal';
import { SlotSuggestionDialog } from '../SlotSuggestionDialog/SlotSuggestionDialog';
import { UnscheduledPanel } from '../UnscheduledPanel/UnscheduledPanel';

export function TodayTimelinePage() {
  const router = useRouter();
  const {
    selectedDate,
    setSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    entries,
    unscheduled,
    freeSlots,
    capacity,
    conflicts,
    isLoading,
    refreshSchedule,
  } = useDailyRhythm();

  const [planningOpen, setPlanningOpen] = useState(false);
  const [replanOpen, setReplanOpen] = useState(false);
  const [newEntryModalOpen, setNewEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);

  const [selectedSlotForFilling, setSelectedSlotForFilling] = useState<FreeTimeSlot | null>(null);
  const [slotSuggestionOpen, setSlotSuggestionOpen] = useState(false);

  // Keyboard shortcuts
  useScheduleShortcuts({
    onNewItem: () => setNewEntryModalOpen(true),
    onGoToToday: goToToday,
    onStartFocus: () => router.push('/app/ritmo-diario/foco'),
    onOpenPlan: () => setPlanningOpen(true),
  });

  const handleCompleteEntry = async (entry: ScheduleEntry) => {
    await dailyRhythmService.completeEntry(entry);
    await refreshSchedule();
  };

  const handleStartFocus = (_entry: ScheduleEntry) => {
    router.push('/app/ritmo-diario/foco');
  };

  const handleReschedule = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setNewEntryModalOpen(true);
  };

  const handleEdit = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setNewEntryModalOpen(true);
  };

  const handleDelete = async (entry: ScheduleEntry) => {
    await dailyRhythmService.deleteScheduleEntry(entry.id);
    await refreshSchedule();
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const handleFillSlot = (slot: FreeTimeSlot) => {
    setSelectedSlotForFilling(slot);
    setSlotSuggestionOpen(true);
  };

  const handleSelectSlotCandidate = async (candidate: ScheduleCandidate, slot: FreeTimeSlot) => {
    await dailyRhythmService.createScheduleEntry({
      sourceType: candidate.sourceType,
      sourceId: candidate.sourceId,
      title: candidate.title,
      date: slot.date,
      startAt: slot.startAt,
      duration: candidate.durationMinutes,
      locked: false,
      status: 'planned',
    });
    await refreshSchedule();
  };

  const handleSaveEntry = async (input: ScheduleEntryInput) => {
    if (editingEntry) {
      await dailyRhythmService.updateScheduleEntry(editingEntry.id, input);
    } else {
      await dailyRhythmService.createScheduleEntry(input);
    }
    setEditingEntry(null);
    await refreshSchedule();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DailyRhythmHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onToday={goToToday}
        onOpenPlanning={() => setPlanningOpen(true)}
        onOpenReplan={() => setReplanOpen(true)}
        onOpenFocus={() => router.push('/app/ritmo-diario/foco')}
        onOpenNewEntry={() => {
          setEditingEntry(null);
          setNewEntryModalOpen(true);
        }}
      />

      <ConflictBanner conflicts={conflicts} />

      <Grid container spacing={3}>
        {/* Main Timeline Stream */}
        <Grid size={{ xs: 12, lg: 8.5 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <DailyTimeline
              date={selectedDate}
              entries={entries}
              freeSlots={freeSlots}
              onCompleteEntry={handleCompleteEntry}
              onStartFocus={handleStartFocus}
              onRescheduleEntry={handleReschedule}
              onEditEntry={handleEdit}
              onDeleteEntry={handleDelete}
              onNavigate={handleNavigate}
              onFillSlot={handleFillSlot}
            />
          )}
        </Grid>

        {/* Side Panel: Capacity + Unscheduled */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Stack spacing={3}>
            <CapacityIndicator capacity={capacity} />
            <UnscheduledPanel
              items={unscheduled}
              onScheduleItem={(item) => {
                setEditingEntry(item);
                setNewEntryModalOpen(true);
              }}
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <DailyPlanningDialog
        open={planningOpen}
        onClose={() => setPlanningOpen(false)}
        targetDate={selectedDate}
        onPlanApplied={refreshSchedule}
      />

      <ReplanDialog
        open={replanOpen}
        onClose={() => setReplanOpen(false)}
        date={selectedDate}
        onReplanApplied={refreshSchedule}
      />

      <SlotSuggestionDialog
        open={slotSuggestionOpen}
        onClose={() => setSlotSuggestionOpen(false)}
        slot={selectedSlotForFilling}
        onSelectCandidate={handleSelectSlotCandidate}
      />

      <ScheduleEntryModal
        open={newEntryModalOpen}
        onClose={() => {
          setNewEntryModalOpen(false);
          setEditingEntry(null);
        }}
        initialDate={selectedDate}
        entryToEdit={editingEntry}
        onSave={handleSaveEntry}
      />
    </Box>
  );
}

