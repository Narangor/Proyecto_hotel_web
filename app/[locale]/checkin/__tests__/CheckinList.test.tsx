import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckinList } from '../components/CheckinList';
import type { CheckinConDatos } from '../hooks/useCheckin';
import type { Checkin } from '@/types';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('../components/CheckinRow', () => ({
  CheckinRow: ({ checkin }: { checkin: Checkin }) => (
    <tr data-testid={`row-${checkin.id}`}>
      <td>{checkin.id}</td>
    </tr>
  ),
}));

jest.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ message }: { message: string }) => (
    <div role="status">{message}</div>
  ),
}));

const checkinCompletado: CheckinConDatos = {
  checkin: {
    id: 'k-001',
    reservaId: 'r-001',
    clienteId: 'c-001',
    habitacionNumero: '201',
    fechaHoraCheckin: '2026-03-21T14:00:00.000Z',
    fechaEsperadaCheckout: '2026-03-24',
    numeroAcompanantes: 1,
    estado: 'completado',
  },
  cliente: undefined,
  reserva: undefined,
};

const checkinPendiente: CheckinConDatos = {
  checkin: {
    ...checkinCompletado.checkin,
    id: 'k-002',
    reservaId: 'r-002',
    habitacionNumero: '202',
    fechaHoraCheckin: null,
    estado: 'pendiente',
  },
  cliente: undefined,
  reserva: undefined,
};

const defaultProps = {
  checkins: [checkinCompletado, checkinPendiente],
  filtroEstado: '' as const,
  onFiltroEstadoChange: jest.fn(),
  onActualizar: jest.fn(),
  onAnular: jest.fn(),
};

describe('CheckinList — renderizado', () => {
  beforeEach(() => jest.clearAllMocks());

  /**
   * Test 1: Con dos check-ins y sin filtro activo, se renderizan ambas filas.
   */
  it('muestra una fila por cada check-in en la lista', () => {
    render(<CheckinList {...defaultProps} />);

    expect(screen.getByTestId('row-k-001')).toBeInTheDocument();
    expect(screen.getByTestId('row-k-002')).toBeInTheDocument();
  });

  /**
   * Test 2: Sin check-ins, muestra el EmptyState.
   */
  it('muestra EmptyState cuando la lista está vacía', () => {
    render(<CheckinList {...defaultProps} checkins={[]} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  /**
   * Test 3: Al cambiar el select de estado, llama onFiltroEstadoChange con el valor seleccionado.
   */
  it('llama onFiltroEstadoChange al cambiar el filtro de estado', async () => {
    const onFiltroEstadoChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CheckinList {...defaultProps} onFiltroEstadoChange={onFiltroEstadoChange} />,
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'completado');

    expect(onFiltroEstadoChange).toHaveBeenCalledWith('completado');
  });
});
