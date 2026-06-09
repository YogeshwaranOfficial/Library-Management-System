import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../store/authStore";

describe("State Machine Verification Suite: Auth Zustand Slice", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("should initialize with default unauthorized state parameters", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });

  it("should capture credentials and update authentication parameters on successful setAuth", () => {
    const mockUser = { id: "USR-001", email: "librarian@library.com", role: "LIBRARIAN" as const };
    const mockToken = "jwt-secret-payload-tokenstring";
    
    useAuthStore.getState().setAuth(mockUser, mockToken);
    
    const updatedState = useAuthStore.getState();
    expect(updatedState.isAuthenticated).toBe(true);
    expect(updatedState.user?.email).toBe("librarian@library.com");
    expect(updatedState.token).toBe(mockToken);
  });
});