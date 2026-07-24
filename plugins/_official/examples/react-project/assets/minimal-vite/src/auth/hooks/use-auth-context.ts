// ----------------------------------------------------------------------

/**
 * Stubbed auth context for the seed. The original template wires this to a
 * provider backed by a backend SDK; the seed ships an unauthenticated stub so
 * the curated layout components keep compiling without those dependencies.
 */
export function useAuthContext() {
  return {
    user: null as Record<string, unknown> | null,
    loading: false,
    authenticated: false,
    unauthenticated: true,
    checkUserSession: async () => {},
  };
}
