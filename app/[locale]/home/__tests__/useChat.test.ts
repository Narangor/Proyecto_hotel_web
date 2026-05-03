import { renderHook, act } from '@testing-library/react';
import { useChat } from '../hooks/useChat';

jest.useFakeTimers();

describe('useChat', () => {
  it('Estado inicial: chat cerrado, un mensaje de bienvenida, sin carga', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.abierto).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('assistant');
    expect(result.current.inputValue).toBe('');
  });

  it('abrirChat / cerrarChat cambia el estado correctamente', () => {
    const { result } = renderHook(() => useChat());

    act(() => { result.current.abrirChat(); });
    expect(result.current.abierto).toBe(true);

    act(() => { result.current.cerrarChat(); });
    expect(result.current.abierto).toBe(false);
  });

  it('enviarMensaje agrega el mensaje del usuario y luego la respuesta del asistente', () => {
    // Inyectamos un timer sincrónico para tests deterministas
    const syncTimer = (fn: () => void, _ms: number) => {
      fn();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    };

    const { result } = renderHook(() => useChat(0, syncTimer));

    act(() => { result.current.setInputValue('precio habitacion'); });
    act(() => { result.current.enviarMensaje(); });

    // Debe haber: bienvenida + usuario + asistente = 3 mensajes
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[1].role).toBe('user');
    expect(result.current.messages[1].text).toBe('precio habitacion');
    expect(result.current.messages[2].role).toBe('assistant');
    expect(result.current.inputValue).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('enviarMensaje no hace nada si el input está vacío', () => {
    const { result } = renderHook(() => useChat());

    act(() => { result.current.enviarMensaje(); });

    // Solo el mensaje de bienvenida, sin cambios
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('La respuesta contiene info de precios cuando se pregunta por precio', () => {
    const syncTimer = (fn: () => void, _ms: number) => {
      fn();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    };

    const { result } = renderHook(() => useChat(0, syncTimer));

    act(() => { result.current.setInputValue('cuánto cuesta la habitación'); });
    act(() => { result.current.enviarMensaje(); });

    const respuesta = result.current.messages[2].text;
    expect(respuesta.toLowerCase()).toMatch(/tarifa|precio|\$/i);
  });
});
