import React, { useState, useEffect } from 'react';
import './AgentSidebar.css';

const AgentSidebar = ({ agents = [], sessions = {}, isRunning = false }) => {
  const [expandedAgents, setExpandedAgents] = useState({});
  const [logs, setLogs] = useState({});
  const [progress, setProgress] = useState({});

  // Initialize expanded state for all agents
  useEffect(() => {
    const initialExpanded = {};
    agents.forEach(agent => {
      initialExpanded[agent.id] = true;
    });
    setExpandedAgents(initialExpanded);
  }, [agents]);

  // Update logs and progress from sessions
  useEffect(() => {
    const newLogs = {};
    const newProgress = {};

    agents.forEach(agent => {
      const session = sessions[agent.id];
      if (session) {
        // Keep last 5 messages
        newLogs[agent.id] = session.messages ? session.messages.slice(-5) : [];
        newProgress[agent.id] = session.progress || 0;
      } else {
        newLogs[agent.id] = [];
        newProgress[agent.id] = 0;
      }
    });

    setLogs(newLogs);
    setProgress(newProgress);
  }, [sessions, agents]);

  const toggleAgent = (agentId) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'status-running';
      case 'idle':
        return 'status-idle';
      case 'error':
        return 'status-error';
      default:
        return 'status-idle';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return '● Running';
      case 'idle':
        return '○ Idle';
      case 'error':
        return '✕ Error';
      default:
        return '○ Idle';
    }
  };

  return (
    <aside className="agent-sidebar">
      <div className="sidebar-header">
        <h2>Agents</h2>
        <div className={`global-status ${isRunning ? 'active' : 'inactive'}`}>
          <span className="status-dot"></span>
          {isRunning ? 'Active' : 'Idle'}
        </div>
      </div>

      <div className="agents-container">
        {agents.length === 0 ? (
          <div className="empty-state">
            <p>No agents available</p>
          </div>
        ) : (
          agents.map(agent => (
            <div key={agent.id} className="agent-card">
              <button
                className="agent-header"
                onClick={() => toggleAgent(agent.id)}
              >
                <div className="agent-info">
                  <span className="agent-name">{agent.id}</span>
                  <span className={`agent-status ${getStatusColor(agent.status)}`}>
                    {getStatusText(agent.status)}
                  </span>
                </div>
                <span className="expand-icon">
                  {expandedAgents[agent.id] ? '▼' : '▶'}
                </span>
              </button>

              {expandedAgents[agent.id] && (
                <div className="agent-content">
                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-label">
                      <span>Progress</span>
                      <span className="progress-value">
                        {progress[agent.id] || 0}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress[agent.id] || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Live Logs */}
                  <div className="logs-section">
                    <h4 className="logs-title">Live Logs</h4>
                    <div className="logs-container">
                      {logs[agent.id]?.length > 0 ? (
                        logs[agent.id].map((log, idx) => (
                          <div key={idx} className="log-entry">
                            <span className="log-timestamp">
                              {new Date().toLocaleTimeString()}
                            </span>
                            <span className="log-message">{log}</span>
                          </div>
                        ))
                      ) : (
                        <div className="empty-logs">No logs yet</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default AgentSidebar;
