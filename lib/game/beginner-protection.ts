export type BeginnerProtectionState = {
  endsAtIso: string;
  breakReason: string | null;
};

export function isBeginnerProtectionActive(state: BeginnerProtectionState, now = new Date()): boolean {
  if (state.breakReason) {
    return false;
  }

  return new Date(state.endsAtIso).getTime() > now.getTime();
}

export function getBeginnerProtectionLabel(state: BeginnerProtectionState, now = new Date()): string {
  if (state.breakReason) {
    return `Ended early: ${state.breakReason}`;
  }

  const msLeft = new Date(state.endsAtIso).getTime() - now.getTime();
  if (msLeft <= 0) {
    return "Expired";
  }

  const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
  return `Active (${hoursLeft}h left)`;
}
