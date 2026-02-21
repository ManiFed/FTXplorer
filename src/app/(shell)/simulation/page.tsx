import { SimulationWorkbench } from '@/components/modules/simulation/SimulationWorkbench';

export default function SimulationPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-heading-1 font-bold text-text-primary mb-2">Simulation Engine</h1>
        <p className="text-body text-text-secondary">
          Expert Mode Monte Carlo what-if scenarios with deterministic seeds, chapter chaining, saved runs, and JSON export.
        </p>
      </div>

      <SimulationWorkbench />
    </div>
  );
}
