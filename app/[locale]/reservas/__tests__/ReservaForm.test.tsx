import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservaForm } from '../components/ReservaForm';
import type { Reserva, Cliente } from '@/types';

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

jest.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, children, title }: { isOpen: boolean; children: React.ReactNode; title: string }) =>
    isOpen ? <div role="dialog"><h2>{title}</h2>{children}</div> : null,
}));

jest.mock('@/components/ui/FormField', () => ({
  FormField: ({ label, error, children }: {
    label: string; error?: string;
    children: (id: string, aria: React.AriaAttributes) => React.ReactNode;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      {children(label, {})}
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

jest.mock('@/lib/mock-data', () => ({
  HABITACIONES: [
    { numero: '101', tipo: 'SENCILLA', piso: 1 },
    { numero: '201', tipo: 'DOBLE', piso: 2 },
  ],
  PRECIOS_HABITACION: { SENCILLA: 100000, DOBLE: 150000, SUITE: 250000, FAMILIAR: 200000 },
}));

jest.mock('../hooks/useReservas', () => ({
  calcularTotal: jest.fn(() => 300000),
}));

const clienteMock: Cliente = {
  id: 'c-001', nombre: 'Carlos', apellido: 'Ruiz', tipoDocumento: 'CC',
  numeroDocumento: '987654321', correo: 'carlos@test.com', telefono: '+57 311 0',
  nacionalidad: 'Colombiana', fechaNacimiento: '1985-03-20',
  estado: 'activo', creadoEn: '2025-01-01T00:00:00.000Z',
};

const reservaExistente: Reserva = {
  id: 'r-edit-1', clienteId: 'c-001', habitacionNumero: '201', tipoHabitacion: 'DOBLE',
  fechaEntrada: '2026-05-10', fechaSalida: '2026-05-13', numeroHuespedes: 2,
  estado: 'confirmada', total: 450000, creadoEn: '2026-03-01T00:00:00.000Z',
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockReturnValue({ ok: true }),
  onEdit: jest.fn().mockReturnValue({ ok: true }),
  reservaInicial: null,
  clientes: [clienteMock],
};

describe('ReservaForm — comportamiento del formulario', () => {
  beforeEach(() => jest.clearAllMocks());

  it('muestra el formulario de creación (modo crear) cuando reservaInicial es null', () => {
    render(<ReservaForm {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('reservas.crearTitulo')).toBeInTheDocument();
  });

  it('muestra errores de validación al intentar guardar sin completar campos requeridos', async () => {
    const user = userEvent.setup();
    render(<ReservaForm {...defaultProps} />);

    const btnGuardar = screen.getByRole('button', { name: /common\.save/i });
    await user.click(btnGuardar);

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('precarga los datos de la reserva en modo edición', () => {
    render(<ReservaForm {...defaultProps} reservaInicial={reservaExistente} />);
    expect(screen.getByText('reservas.editarTitulo')).toBeInTheDocument();

    // La fecha de entrada debe estar precargada
    const inputFechaEntrada = screen.getByLabelText('reservas.campos.fechaEntrada') as HTMLInputElement;
    expect(inputFechaEntrada.value).toBe('2026-05-10');
  });
});
