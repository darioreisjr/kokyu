'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDateHeading } from '@/features/leisure/utils/dateHelpers';
import { profileService } from '@/features/profile/services/profileService';
import type { UserProfile } from '@/features/profile/types/profile.types';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { dailyRhythmService } from '@/features/daily-rhythm/services/dailyRhythmService';
import { SlotSuggestionDialog } from '@/features/daily-rhythm/components/SlotSuggestionDialog/SlotSuggestionDialog';
import type { FreeTimeSlot, ScheduleCandidate, ScheduleEntry } from '@/shared/scheduling/types';
import {
  HOME_ESSENTIAL_SECTIONS,
  type HomeQuickAction,
  type HomeSectionId,
} from '@/shared/home/types';
import { useHomeSnapshot } from '../../hooks/useHomeSnapshot';
import { getDayMoment } from '../../services/homeDayService';
import { homeQuickCompleteService } from '../../services/homeQuickCompleteService';
import { HomeAreasGrid } from '../HomeAreasGrid/HomeAreasGrid';
import { HomeAttention } from '../HomeAttention/HomeAttention';
import { HomeCapacity } from '../HomeCapacity/HomeCapacity';
import { HomeFocus } from '../HomeFocus/HomeFocus';
import { HomeFreeTimeCard } from '../HomeFreeTimeCard/HomeFreeTimeCard';
import { HomeNextTimeline } from '../HomeNextTimeline/HomeNextTimeline';
import { HomeNowCard } from '../HomeNowCard/HomeNowCard';
import { HomePersonalizationDialog } from '../HomePersonalizationDialog/HomePersonalizationDialog';
import { HomeQuickActions } from '../HomeQuickActions/HomeQuickActions';
import { RespirationEmptyState } from '../RespirationEmptyState/RespirationEmptyState';
import { RespirationHeader } from '../RespirationHeader/RespirationHeader';

const EMPTY_ENTRIES: ScheduleEntry[] = [];

/**
 * The Respiração home page — composes `HomeSnapshot` into the sections
 * spec'd in `docs/respiration-home.md`, in the order/visibility the user
 * chose via "Personalizar Respiração" (`preferences.home`). Never fetches
 * a feature's data directly: everything here comes from `useHomeSnapshot`.
 */
export function RespirationPage() {
  const router = useRouter();
  const { preferences, updateSection } = usePreferences();
  const { snapshot, isLoading, refresh } = useHomeSnapshot();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [suggestionSlot, setSuggestionSlot] = useState<FreeTimeSlot | null>(null);

  useEffect(() => {
    let cancelled = false;
    profileService
      .getProfile()
      .then((loaded) => {
        if (!cancelled) setProfile(loaded);
      })
      .catch(() => {
        // Greeting/avatar are optional decoration here — a failed fetch just leaves them blank.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const now = snapshot ? new Date(snapshot.now) : new Date();
  const homePrefs = preferences.home;

  function handleNavigate(href: string) {
    router.push(href);
  }

  async function handleCompleteEntry(entry: ScheduleEntry) {
    // `dailyRhythmService.completeEntry` already dispatches to the right
    // source adapter (`missionScheduleAdapter.onEntryCompleted` included)
    // — a Mission reached through the schedule is a different mock store
    // than the one `HomeFocus`'s own "Em foco" checkbox writes to below,
    // and this must go through the adapter that `currentEntry` actually
    // came from, not `homeQuickCompleteService`.
    await dailyRhythmService.completeEntry(entry);
    await refresh();
  }

  function handleStartFocus() {
    router.push('/app/ritmo-diario/foco');
  }

  async function handleCompleteMissionFocus(id: string) {
    await homeQuickCompleteService.completeMission(id);
    await refresh();
  }

  async function handleSelectCandidate(candidate: ScheduleCandidate, slot: FreeTimeSlot) {
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
    await refresh();
  }

  function handleQuickAction(action: HomeQuickAction) {
    router.push(action.href);
  }

  function handleOpenPlanning() {
    router.push('/app/ritmo-diario');
  }

  const visibleSections = homePrefs.sectionOrder.filter((id) => {
    if (HOME_ESSENTIAL_SECTIONS.includes(id)) return true;
    if (homePrefs.hiddenSections.includes(id)) return false;
    if (id === 'attention') return (snapshot?.alerts.length ?? 0) > 0;
    if (id === 'freeTime') return Boolean(snapshot?.currentFreeSlot) && !snapshot?.currentEntry;
    return true;
  });

  function renderSection(id: HomeSectionId) {
    switch (id) {
      case 'now':
        return (
          <HomeNowCard
            key={id}
            currentEntry={snapshot?.currentEntry ?? null}
            freeSlot={snapshot?.currentFreeSlot ?? null}
            now={now}
            isLoading={isLoading && !snapshot}
            trainingHasActiveSession={snapshot?.training.data?.hasActiveSession ?? false}
            onComplete={handleCompleteEntry}
            onStartFocus={handleStartFocus}
            onNavigate={handleNavigate}
            onOpenFreeTime={setSuggestionSlot}
          />
        );
      case 'next':
        return (
          <HomeNextTimeline
            key={id}
            entries={snapshot?.nextEntries ?? EMPTY_ENTRIES}
            isLoading={isLoading && !snapshot}
            onNavigateToRhythm={() => handleNavigate('/app/ritmo-diario')}
          />
        );
      case 'focus':
        return (
          <HomeFocus
            key={id}
            priorities={snapshot?.dailyPriorities ?? []}
            isLoading={isLoading && !snapshot}
            onCompleteMission={handleCompleteMissionFocus}
            onNavigate={handleNavigate}
          />
        );
      case 'rhythm':
        return (
          <HomeCapacity
            key={id}
            capacity={snapshot?.schedule.data?.capacity ?? null}
            now={now}
            hasAnyEntry={snapshot?.schedule.data?.hasAnyEntry ?? false}
            showCapacity={homePrefs.showCapacity}
            isLoading={isLoading && !snapshot}
            onOpenPlanning={handleOpenPlanning}
          />
        );
      case 'areas':
        return (
          <HomeAreasGrid
            key={id}
            missions={snapshot?.missions ?? { sourceType: 'mission', status: 'success', data: null }}
            habits={snapshot?.habits ?? { sourceType: 'habit', status: 'success', data: null }}
            training={snapshot?.training ?? { sourceType: 'training', status: 'success', data: null }}
            nutrition={snapshot?.nutrition ?? { sourceType: 'nutrition', status: 'success', data: null }}
            goals={snapshot?.goals ?? { sourceType: 'goal', status: 'success', data: null }}
            leisure={snapshot?.leisure ?? { sourceType: 'leisure', status: 'success', data: null }}
            isLoading={isLoading && !snapshot}
            onOpen={handleNavigate}
          />
        );
      case 'attention':
        return <HomeAttention key={id} items={snapshot?.alerts ?? []} onOpen={handleNavigate} />;
      case 'freeTime':
        return (
          <HomeFreeTimeCard
            key={id}
            freeSlot={snapshot?.currentFreeSlot ?? null}
            onSelectCandidate={handleSelectCandidate}
            onOpenFullList={setSuggestionSlot}
          />
        );
      case 'quickActions':
        return (
          <HomeQuickActions key={id} actions={snapshot?.quickActions ?? []} onSelect={handleQuickAction} />
        );
      default:
        return null;
    }
  }

  const showEmptyOnboarding = !isLoading && snapshot !== null && !snapshot.hasAnyPlannedActivity;

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/*
        The page's real heading — visually hidden, "Respiração" is already the
        visible nav/tab title (see spec's "HEADING STRUCTURE"). Width/height/
        margin are plain pixel *strings* here, not bare numbers — MUI's `sx`
        treats a bare 0–1 number for width/height as a percentage and scales
        a bare margin number by the spacing unit, which turned this into a
        100%-wide, off-by-a-few-px box that overflowed the viewport on narrow
        screens instead of the intended 1x1px clipped box.
      */}
      <Typography
        component="h1"
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Respiração
      </Typography>

      <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 1 }}>
        <Typography
          component="button"
          variant="labelMedium"
          onClick={() => setPersonalizationOpen(true)}
          sx={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
        >
          Personalizar Respiração
        </Typography>
      </Stack>

      <RespirationHeader
        dateLabel={formatDateHeading(now)}
        dayMoment={getDayMoment(now)}
        firstName={profile?.firstName}
        lastName={profile?.lastName}
        avatarUrl={profile?.avatarUrl}
        showGreeting={homePrefs.showGreeting}
      />

      {showEmptyOnboarding ? (
        <RespirationEmptyState onNavigate={handleNavigate} />
      ) : (
        <Stack spacing={3}>{visibleSections.map((id) => renderSection(id))}</Stack>
      )}

      <SlotSuggestionDialog
        open={suggestionSlot !== null}
        onClose={() => setSuggestionSlot(null)}
        slot={suggestionSlot}
        onSelectCandidate={handleSelectCandidate}
      />

      <HomePersonalizationDialog
        open={personalizationOpen}
        onClose={() => setPersonalizationOpen(false)}
        value={homePrefs}
        onChange={(patch) => updateSection('home', patch)}
      />
    </Box>
  );
}
