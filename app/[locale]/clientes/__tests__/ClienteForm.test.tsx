import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClienteForm } from '../components/ClienteForm';
import type { Cliente } from '@/types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
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
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

jest.mock('@/components/ui/FormField', () => ({
  FormField: ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    required?: boolean;
    children: (id: string, aria: React.AriaAttributes) => React.ReactNode;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      {children(label, { 'aria-required': true })}
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const clienteExistente: Cliente = {
  id: 'c-edit-1',
  nombre: 'Carlos',
  apellido: 'Ruiz',
  tipoDocumento: 'CC',
  numeroDocumento: '987654321',
  correo: 'carlos@test.com',
  telefono: '+57 311 000 0000',
  nacionalidad: 'Colombiana',
  fechaNacimiento: '1985-03-20',
  estado: 'activo',
  creadoEn: '2025-01-01T00:00:00.000Z',
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockReturnValue({ ok: true }),
  onEdit: jest.fn().mockReturnValue({ ok: true }),
  clienteInicial: null,
};

// ── Tests de ClienteForm ───────────────────────────────────────────────────────

describe('ClienteForm — comportamiento del formulario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * HU-C2: El formulario de creación renderiza los campos correctamente.
   */
  it('muestra el formulario de creación con campos vacíos cuando clienteInicial es null', () => {
    render(<ClienteForm {...defaultProps} />);

    // El modal debe estar abierto (modo crear)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Nombre vacío
    const inputNombre = screen.getByLabelText('clientes.campos.nombre');
    expect(inputNombre).toHaveValue('');
  });

  /**
   * HU-C2: Al intentar enviar sin nombre, se muestra el error de validación.
   */
  it('muestra error de validación cuando el nombre está vacío al enviar', async () => {
    const user = userEvent.setup();
    render(<ClienteForm {...defaultProps} />);

    // Enviar sin completar nombre
    const submitBtn = screen.getByRole('button', { name: /common\.save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      // El error del nombre debe aparecer (role="alert")
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    // onSubmit NO debe haberse llamado
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  /**
   * HU-C3: El formulario de edición se precarga con los datos del cliente.
   */
  it('precarga los datos del cliente al abrir en modo edición', () => {
    render(
      <ClienteForm {...defaultProps} clienteInicial={clienteExistente} />,
    );

    const inputNombre = screen.getByLabelText('clientes.campos.nombre');
    expect(inputNombre).toHaveValue('Carlos');

    const inputApellido = screen.getByLabelText('clientes.campos.apellido');
    expect(inputApellido).toHaveValue('Ruiz');
  });

  /**
   * HU-C3: En modo edición, el campo número de documento está deshabilitado.
   */
  it('deshabilita el campo número de documento en modo edición', () => {
    render(
      <ClienteForm {...defaultProps} clienteInicial={clienteExistente} />,
    );

    const inputDoc = screen.getByLabelText('clientes.campos.numeroDocumento');
    expect(inputDoc).toBeDisabled();
  });
});
