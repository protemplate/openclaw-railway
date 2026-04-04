# AgentSidebar Component

Real-time monitoring sidebar for OpenClaw sub-agents with expandable cards, progress tracking, and live log streaming.

## Features

- **Expandable Agent Cards** — Click to expand/collapse individual agent details
- **Real-time Progress Bars** — Visual progress indicators (0-100%) with smooth animations
- **Live Log Streaming** — Display last 5 messages per agent with timestamps
- **Status Indicators** — Running/Idle/Error states with color coding
- **Mobile Responsive** — Full-width on tablets, horizontal scroll on phones
- **GitHub-inspired UI** — Dark mode design with modern aesthetics
- **WebSocket Ready** — Integrates with OpenClaw session system for real-time updates

## Installation

Copy the component directory to your React project:

```bash
cp -r src/components/AgentSidebar your-project/src/components/
```

## Usage

### Basic Example

```jsx
import AgentSidebar from './components/AgentSidebar';

function App() {
  const agents = [
    { id: 'coordinador', status: 'running' },
    { id: 'housekeeping', status: 'idle' },
    { id: 'gerencia', status: 'running' },
    { id: 'fb', status: 'idle' },
    { id: 'mantenimiento', status: 'idle' },
  ];

  const sessions = {
    coordinador: {
      progress: 45,
      messages: [
        'Processing guest request',
        'Contacting housekeeping',
        'Updating reservation',
      ],
    },
    housekeeping: {
      progress: 0,
      messages: [],
    },
  };

  return (
    <AgentSidebar
      agents={agents}
      sessions={sessions}
      isRunning={true}
    />
  );
}
```

### With WebSocket (Real-time Updates)

```jsx
import { useEffect, useState } from 'react';
import AgentSidebar from './components/AgentSidebar';

function App() {
  const [agents, setAgents] = useState([]);
  const [sessions, setSessions] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Connect to OpenClaw WebSocket
    const ws = new WebSocket('wss://openclaw-api/ws/agents');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Update agents list
      setAgents(data.agents || []);

      // Update sessions with progress and logs
      setSessions(data.sessions || {});

      // Update global running state
      setIsRunning(data.isRunning || false);
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <AgentSidebar agents={agents} sessions={sessions} isRunning={isRunning} />
      <main style={{ flex: 1 }}>
        {/* Your main content here */}
      </main>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `agents` | Array | `[]` | Array of agent objects with `id` and `status` properties |
| `sessions` | Object | `{}` | Object mapping agent IDs to session data (progress, messages) |
| `isRunning` | Boolean | `false` | Global state indicator (affects status dot animation) |

### Agent Object Structure

```javascript
{
  id: string,           // Unique agent identifier (e.g., 'coordinador')
  status: string        // 'running' | 'idle' | 'error'
}
```

### Session Object Structure

```javascript
{
  [agentId]: {
    progress: number,      // 0-100 progress percentage
    messages: string[]     // Array of log messages (last 5 shown)
  }
}
```

## Styling

### Customization

To customize colors and styling, override CSS variables or modify `AgentSidebar.css`:

```css
/* Example: Change primary accent color */
.progress-fill {
  background: linear-gradient(90deg, #your-color-1 0%, #your-color-2 100%);
}

.status-running {
  color: #your-running-color;
  background: rgba(your-r, your-g, your-b, 0.15);
}
```

### Responsive Breakpoints

- **Desktop** (>768px) — Sidebar 320px fixed width on left
- **Tablet** (481-768px) — Sidebar becomes horizontal scroll at bottom
- **Mobile** (<480px) — Full-width responsive layout

## Integration with OpenClaw

### Placing in Your Layout

```jsx
import AgentSidebar from './components/AgentSidebar';

export default function OpenClawDashboard() {
  return (
    <div className="app-container">
      <AgentSidebar {...sidebarProps} />
      <div className="main-content">
        {/* Your dashboard content */}
      </div>
    </div>
  );
}
```

### Connecting to OpenClaw Gateway

Ensure your WebSocket endpoint connects to the OpenClaw gateway:

```javascript
const gatewayUrl = 'https://your-openclaw-instance/ws/agents';
const ws = new WebSocket(gatewayUrl);
```

## Performance Notes

- Component uses React hooks (`useState`, `useEffect`) for optimal performance
- Logs are trimmed to last 5 messages to minimize re-renders
- Progress animations use `cubic-bezier` for smooth transitions
- CSS transitions are hardware-accelerated (transform/opacity only)

## Browser Support

- Modern browsers with ES6 support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Part of OpenClaw project. See main LICENSE file.
