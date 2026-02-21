export default function TimelinePage() {
  return (
    <div className="p-6">
      <h1 className="text-heading-1 font-bold text-text-primary mb-2">Master Timeline</h1>
      <p className="text-body text-text-secondary">
        Zoomable swimlane timeline covering 2017–2024. Coming in Phase 2.
      </p>
      <div className="mt-8 flex items-center justify-center h-64 rounded-lg border border-border border-dashed">
        <span className="text-text-muted">Timeline visualization will render here</span>
      </div>
    </div>
  );
}
