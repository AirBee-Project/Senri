export type Result<T, E> =
  | { success: true; result: T }
  | { success: false; error: E };

export function ok<T, E = never>(result: T): Result<T, E> {
  return {
    success: true,
    result,
  };
}

export function err<T = never, E = unknown>(error: E): Result<T, E> {
  return {
    success: false,
    error,
  };
}
