import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientesList } from '../components/ClientesList';
import type { Cliente } from '@/types';

// Mocks de next-intl: devuelve la clave como texto para simplificar assertions
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock de componentes hijos que tienen sus propias dependencias
jest.mock('../components/ClienteRow', () => ({
  ClienteRow: ({ cliente, onEditar, onEliminar }: {
    cliente: Cliente;
    onEditar: (c: Cliente) => void;
    onEliminar: (c: Cliente) => void;
  }) => (
    <tr data-testid={`row-${cliente.id}`}>
      <td>{cliente.nombre} {cliente.apellido}</td>
      <td>
        <button onClick={() => onEditar(cliente)}>edit</button>
        <button onClick={() => onEliminar(cliente)}>delete</button>
      </td>
    </tr>
  ),
}));

jest.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ message }: { message: string }) => (
    <div role="status">{message}</div>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const clienteMock: Cliente = {
  id: 'c-1',
  nombre: 'Ana',
  apellido: 'López',
  tipoDocumento: 'CC',
  numeroDocumento: '123456',
  correo: 'ana@test.com',
  telefono: '+57 300 000 0000',
  nacionalidad: 'Colombiana',
  fechaNacimiento: '1990-01-01',
  estado: 'activo',
  creadoEn: '2025-01-01T00:00:00.000Z',
};

const defaultProps = {
  clientes: [clienteMock],
  filtro: '',
  onFiltroChange: jest.fn(),
  pagina: 1,
  totalPaginas: 1,
  onPaginaChange: jest.fn(),
  onEditar: jest.fn(),
  onEliminar: jest.fn(),
};

// ── Tests adicionales de renderizado ──────────────────────────────────────────

describe('ClientesList — renderizado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra una fila por cada cliente en la lista', () => {
    render(<ClientesList {...defaultProps} />);
    expect(screen.getByTestId('row-c-1')).toBeInTheDocument();
  });

  it('muestra el EmptyState cuando la lista de clientes está vacía', () => {
    render(<ClientesList {...defaultProps} clientes={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('llama onFiltroChange cuando el usuario escribe en el buscador', async () => {
    const onFiltroChange = jest.fn();
    const user = userEvent.setup();
    render(<ClientesList {...defaultProps} onFiltroChange={onFiltroChange} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'Ana');

    expect(onFiltroChange).toHaveBeenCalled();
  });
});
