export function JourneyTab() {
  return (
    <div className="flex h-96 flex-col items-center justify-center gap-1.5 text-center">
      <p className="text-sm font-medium text-foreground/80">Journeys</p>
      <p className="max-w-xs text-xs text-muted-foreground/60">
        Paying-visitor timelines — profile, events and payment. Defaults to
        paying visitors, filterable to all. Coming after funnels.
      </p>
    </div>
  );
}
