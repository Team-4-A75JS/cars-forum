import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MyProfile from "./MyProfile.jsx";

const authState = {
  profile: {
    id: "user-1",
    username: "kaloyan",
    first_name: "Kaloyan",
    last_name: "Kissiov",
    role: "user",
    is_blocked: false,
    created_at: "2026-02-25T12:00:00.000Z",
    reputation: 125,
    postsCount: 10,
    commentsCount: 11,
    avatar_url: null,
  },
  authLoading: false,
  refreshProfile: vi.fn().mockResolvedValue(undefined),
};

vi.mock("../../context/useAuth", () => ({
  useAuth: () => authState,
}));

const updateMyProfile = vi.fn();

vi.mock("../../services/profileService", () => ({
  updateMyProfile: (...args) => updateMyProfile(...args),
}));

describe("MyProfile", () => {
  beforeEach(() => {
    updateMyProfile.mockReset();
    authState.refreshProfile.mockClear();
  });

  it("renders reputation stats and badges from profile details", async () => {
    render(<MyProfile />);

    expect(screen.getByText("Reputation")).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();
    expect(screen.getByText("Top Contributor")).toBeInTheDocument();
    expect(screen.getByText("Builder")).toBeInTheDocument();
  });

  it("submits updated first and last name", async () => {
    updateMyProfile.mockResolvedValue({
      ...authState.profile,
      first_name: "Kaloyan",
      last_name: "Updated",
    });

    render(<MyProfile />);

    fireEvent.change(screen.getByDisplayValue("Kissiov"), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(updateMyProfile).toHaveBeenCalledWith({
        username: "kaloyan",
        first_name: "Kaloyan",
        last_name: "Updated",
        avatar_url: null,
      }),
    );
    await waitFor(() => expect(authState.refreshProfile).toHaveBeenCalled());
  });
});
