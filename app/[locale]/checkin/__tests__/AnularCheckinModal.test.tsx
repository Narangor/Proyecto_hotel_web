import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnularCheckinModal } from '../components/AnularCheckinModal';
import type { Checkin, Cliente } from '@/types';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components/ui/Modal', () => ({
  Modal: ({
    isOpen,
    children,
    title,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    title: string;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
}));

const checkinMock: Checkin = {
  id: 'k-001',
  reservaId: 'r-001',
  clienteId: 'c-001',
  habitacionNumero: '201',
  fechaHoraCheckin: '2026-03-21T14:00:00.000Z',
  fechaEsperadaCheckout: '2026-03-24',
  numeroAcompanantes: 1,
  estado: 'completado',
};

const clienteMock: Cliente = {
  id: 'c-001',
  nombre: 'Valentina',
  apellido: 'Gómez',
  tipoDocumento: 'CC',
  numeroDocumento: '1020345678',
  correo: 'valentina@test.com',
  telefono: '+57 310 000 0000',
  nacionalidad: 'Colombiana',
  fechaNacimiento: '1992-04-15',
  estado: 'activo',
  creadoEn: '2025-01-01T00:00:00.000Z',
};

describe('AnularCheckinModal — HU-K4', () => {
  beforeEach(() => jest.clearAllMocks());

  /**
   * Test 1: El textarea de motivo está presente y es obligatorio (aria-required).
   */
  it('renderiza el campo de motivo como requerido', () => {
    render(
      <AnularCheckinModal
        checkin={checkinMock}
        cliente={clienteMock}
        onAnular={jest.fn().mockReturnValue({ ok: true })}
        onCerrar={jest.fn()}
      />,
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('aria-required', 'true');
  });

  /**
   * Test 2: Si se confirma con el motivo vacío, onAnular recibe la señal de error
   *         y aparece el mensaje de validación.
   */
  it('muestra error de validación cuando se confirma sin motivo', async () => {
    const onAnular = jest
      .fn()
      .mockReturnValue({ ok: false, error: 'motivoRequerido' });
    const user = userEvent.setup();

    render(
      <AnularCheckinModal
        checkin={checkinMock}
        cliente={clienteMock}
        onAnular={onAnular}
        onCerrar={jest.fn()}
      />,
    );

    // Confirmar sin escribir motivo
    const confirmarBtn = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmarBtn);

    // El mensaje de error debe aparecer (aria-live alert)
    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toBeInTheDocument();
  });

  /**
   * Test 3: Con un motivo válido, se llama onAnular y luego onCerrar.
   */
  it('llama onAnular con el motivo y cierra el modal al confirmar con texto válido', async () => {
    const onAnular = jest.fn().mockReturnValue({ ok: true });
    const onCerrar = jest.fn();
    const user = userEvent.setup();

    render(
      <AnularCheckinModal
        checkin={checkinMock}
        cliente={clienteMock}
        onAnular={onAnular}
        onCerrar={onCerrar}
      />,
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Error de registro — el huésped ingresó por otra recepción');

    const confirmarBtn = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmarBtn);

    expect(onAnular).toHaveBeenCalledWith(
      'k-001',
      'Error de registro — el huésped ingresó por otra recepción',
    );
    expect(onCerrar).toHaveBeenCalled();
  });
});
