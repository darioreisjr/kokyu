import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { recoveryEstimateService } from '../../services/recoveryEstimateService';
import { resetTrainingDb } from '../../services/trainingMockDb';
import { RecoveryCheckInDialog } from './RecoveryCheckInDialog';

describe('RecoveryCheckInDialog', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('never frames the check-in as a medical diagnosis, only a soft, self-reported estimate', () => {
    render(<RecoveryCheckInDialog open onClose={() => {}} onSubmitted={() => {}} />);
    expect(screen.getByText('Como você está se sentindo para treinar?')).toBeInTheDocument();
    expect(screen.queryByText(/diagnóstic/i)).not.toBeInTheDocument();
  });

  it('renders energy, disposition and soreness as 1-5 rating scales', () => {
    render(<RecoveryCheckInDialog open onClose={() => {}} onSubmitted={() => {}} />);
    expect(screen.getByLabelText('Energia, de 1 a 5')).toBeInTheDocument();
    expect(screen.getByLabelText('Disposição, de 1 a 5')).toBeInTheDocument();
    expect(screen.getByLabelText('Desconforto muscular, de 1 a 5')).toBeInTheDocument();
  });

  it('calls onClose when "Cancelar" is clicked without submitting anything', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmitted = vi.fn();
    render(<RecoveryCheckInDialog open onClose={onClose} onSubmitted={onSubmitted} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it('submits the check-in with notes and calls onSubmitted then onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmitted = vi.fn();
    const submitSpy = vi.spyOn(recoveryEstimateService, 'submitRecoveryCheckIn');

    render(<RecoveryCheckInDialog open onClose={onClose} onSubmitted={onSubmitted} />);
    await user.type(screen.getByLabelText('Notas (opcional)'), 'Ainda um pouco cansado.');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        energyLevel: 3,
        disposition: 3,
        muscleSoreness: 2,
        notes: 'Ainda um pouco cansado.',
      }),
    );
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    render(<RecoveryCheckInDialog open={false} onClose={() => {}} onSubmitted={() => {}} />);
    expect(screen.queryByText('Como você está se sentindo para treinar?')).not.toBeInTheDocument();
  });
});
