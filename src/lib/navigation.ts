import type { NavModule } from '@/types';

export const NAV_MODULES: NavModule[] = [
  {
    id: 'walkthrough',
    label: 'Collapse Walkthrough',
    path: '/walkthrough',
    icon: '📖',
    description: 'Guided narrative through the FTX collapse',
  },
  {
    id: 'timeline',
    label: 'Master Timeline',
    path: '/timeline',
    icon: '📅',
    description: 'Zoomable swimlane timeline of all events',
  },
  {
    id: 'people',
    label: 'People & Influence',
    path: '/people',
    icon: '👥',
    description: 'Org chart, people graph, and influence web',
  },
  {
    id: 'financial',
    label: 'Financial Reconstruction',
    path: '/financial',
    icon: '💰',
    description: 'Balance sheets, trading data, and fund flows',
  },
  {
    id: 'trial',
    label: 'Trial Explorer',
    path: '/trial',
    icon: '⚖️',
    description: 'Evidence library, testimony, and charges',
  },
  {
    id: 'simulation',
    label: 'Simulation Engine',
    path: '/simulation',
    icon: '🔮',
    description: 'Monte Carlo what-if scenarios',
  },
  {
    id: 'ftx-today',
    label: 'FTX Today',
    path: '/ftx-today',
    icon: '📊',
    description: 'Real-time competitive comparison',
  },
  {
    id: 'bankruptcy',
    label: 'Bankruptcy & Recovery',
    path: '/bankruptcy',
    icon: '📋',
    description: 'Claims, asset recovery, and proceedings',
  },
];
