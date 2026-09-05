'use client';

import { useCallback, useEffect, useState } from 'react';
import { missionProjectService } from '../services/missionProjectService';
import type { Mission, MissionProject, MissionProjectProgress, MissionSection } from '../types';

export function useMissionProject(id: string) {
  const [project, setProject] = useState<MissionProject | null>(null);
  const [sections, setSections] = useState<MissionSection[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [progress, setProgress] = useState<MissionProjectProgress>({ completedCount: 0, eligibleCount: 0, percent: 0 });
  const [nextAction, setNextAction] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      missionProjectService.getProject(id),
      missionProjectService.getSections(id),
      missionProjectService.getProjectMissions(id),
      missionProjectService.getProjectProgress(id),
      missionProjectService.getProjectNextAction(id),
    ]).then(([projectData, sectionsData, missionsData, progressData, nextActionData]) => {
      if (!cancelled) {
        setProject(projectData);
        setSections(sectionsData);
        setMissions(missionsData);
        setProgress(progressData);
        setNextAction(nextActionData);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return { project, sections, missions, progress, nextAction, isLoading, refresh };
}
