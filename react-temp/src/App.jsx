import { useEffect, useState } from 'react'
import './App.css'

const namespaces = ['default', 'kube-system', 'production', 'staging']

const podData = {
  default: [
    { name: 'frontend-7d9c8f6d7b-x2k4m', status: 'Running', restarts: 0, cpu: 42, memory: 128 },
    { name: 'api-6b8f7d9c4f-p8q2r', status: 'Running', restarts: 1, cpu: 67, memory: 256 },
    { name: 'worker-5c7d9f8b6a-m3n7p', status: 'Running', restarts: 0, cpu: 31, memory: 192 },
  ],
  'kube-system': [
    { name: 'coredns-5d78c9869d-k7x4p', status: 'Running', restarts: 0, cpu: 18, memory: 74 },
    { name: 'metrics-server-6f8c9d7b5f-v2m8q', status: 'Running', restarts: 2, cpu: 29, memory: 112 },
    { name: 'kube-proxy-j8k2m', status: 'Running', restarts: 0, cpu: 12, memory: 46 },
  ],
  production: [
    { name: 'web-7f6c8d9b5c-a1b2c', status: 'Running', restarts: 0, cpu: 73, memory: 318 },
    { name: 'web-7f6c8d9b5c-d4e5f', status: 'Running', restarts: 1, cpu: 81, memory: 342 },
    { name: 'payments-6c7d8e9f4a-g6h7j', status: 'Running', restarts: 0, cpu: 56, memory: 224 },
    { name: 'queue-5b8c9d7e6f-k8m9n', status: 'Running', restarts: 3, cpu: 38, memory: 187 },
  ],
  staging: [
    { name: 'web-6a7b8c9d5e-p2q3r', status: 'Running', restarts: 0, cpu: 34, memory: 156 },
    { name: 'api-5f6e7d8c9b-s4t5u', status: 'Pending', restarts: 0, cpu: 0, memory: 0 },
  ],
}

const deploymentData = {
  default: [
    { name: 'frontend', ready: '3/3', updated: '3', available: '3' },
    { name: 'api', ready: '2/2', updated: '2', available: '2' },
  ],
  'kube-system': [
    { name: 'coredns', ready: '2/2', updated: '2', available: '2' },
    { name: 'metrics-server', ready: '1/1', updated: '1', available: '1' },
  ],
  production: [
    { name: 'web', ready: '6/6', updated: '6', available: '6' },
    { name: 'payments', ready: '3/3', updated: '3', available: '3' },
    { name: 'queue', ready: '2/2', updated: '2', available: '2' },
  ],
  staging: [
    { name: 'web', ready: '2/2', updated: '2', available: '2' },
    { name: 'api', ready: '1/1', updated: '1', available: '1' },
  ],
}

function App() {
  const [namespace, setNamespace] = useState('default')
  const [pods, setPods] = useState(podData.default)
  const [deployments, setDeployments] = useState(deploymentData.default)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [activeView, setActiveView] = useState('overview')

  useEffect(() => {
    let cancelled = false

    const loadNamespace = async () => {
      const selectedNamespace = namespace

      // Simulated API latency. Different namespaces intentionally
      // resolve at different speeds to make polling behavior realistic.
      const delay =
        selectedNamespace === 'production'
          ? 1200
          : selectedNamespace === 'staging'
            ? 700
            : 300

      await new Promise((resolve) => setTimeout(resolve, delay))

      if (cancelled) return

      setPods(
        podData[selectedNamespace].map((pod) => ({
          ...pod,
          cpu: Math.max(1, pod.cpu + Math.floor(Math.random() * 11) - 5),
        })),
      )
      setDeployments(deploymentData[selectedNamespace])
      setLastUpdated(new Date())
    }

    loadNamespace()

    const interval = setInterval(loadNamespace, 5000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [namespace])

  const totalCpu = pods.reduce((sum, pod) => sum + pod.cpu, 0)
  const totalMemory = pods.reduce((sum, pod) => sum + pod.memory, 0)
  const runningPods = pods.filter((pod) => pod.status === 'Running').length

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">K8s</div>
          <div>
            <h1>Kubernetes Dashboard</h1>
            <span>Cluster operations console</span>
          </div>
        </div>

        <div className="cluster-status">
          <span className="status-dot" />
          Cluster healthy
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-title">WORKLOADS</div>

          <button
            className={activeView === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveView('overview')}
          >
            <span>◈</span>
            Overview
          </button>

          <button
            className={activeView === 'pods' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveView('pods')}
          >
            <span>●</span>
            Pods
          </button>

          <button
            className={activeView === 'deployments' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveView('deployments')}
          >
            <span>▣</span>
            Deployments
          </button>

          <div className="sidebar-title">OBSERVABILITY</div>

          <button
            className={activeView === 'resources' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveView('resources')}
          >
            <span>▥</span>
            Resource usage
          </button>

          <div className="sidebar-footer">
            <div>Cluster</div>
            <strong>minerva-demo</strong>
            <small>v1.30.2</small>
          </div>
        </aside>

        <main className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">CLUSTER / WORKLOADS</p>
              <h2>
                {activeView === 'overview' && 'Cluster overview'}
                {activeView === 'pods' && 'Pods'}
                {activeView === 'deployments' && 'Deployments'}
                {activeView === 'resources' && 'Resource usage'}
              </h2>
            </div>

            <label className="namespace-control">
              <span>Namespace</span>
              <select
                value={namespace}
                onChange={(event) => setNamespace(event.target.value)}
              >
                {namespaces.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="metrics">
            <div className="metric-card">
              <span className="metric-label">NODES</span>
              <strong>6</strong>
              <small>6 ready</small>
            </div>

            <div className="metric-card">
              <span className="metric-label">PODS</span>
              <strong>{runningPods}/{pods.length}</strong>
              <small>{namespace} namespace</small>
            </div>

            <div className="metric-card">
              <span className="metric-label">DEPLOYMENTS</span>
              <strong>{deployments.length}</strong>
              <small>All available</small>
            </div>

            <div className="metric-card">
              <span className="metric-label">CPU</span>
              <strong>{totalCpu}%</strong>
              <small>Cluster allocation</small>
            </div>

            <div className="metric-card">
              <span className="metric-label">MEMORY</span>
              <strong>{totalMemory} Mi</strong>
              <small>Current usage</small>
            </div>
          </section>

          {(activeView === 'overview' || activeView === 'pods') && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Pods</h3>
                  <p>Live workload status in {namespace}</p>
                </div>

                <div className="live-indicator">
                  <span className="status-dot" />
                  Polling every 5s
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Restarts</th>
                      <th>CPU</th>
                      <th>Memory</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pods.map((pod) => (
                      <tr key={pod.name}>
                        <td className="resource-name">{pod.name}</td>
                        <td>
                          <span
                            className={
                              pod.status === 'Running'
                                ? 'badge success'
                                : 'badge warning'
                            }
                          >
                            <span className="status-dot" />
                            {pod.status}
                          </span>
                        </td>
                        <td>{pod.restarts}</td>
                        <td>{pod.cpu}%</td>
                        <td>{pod.memory} Mi</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {(activeView === 'overview' || activeView === 'deployments') && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Deployments</h3>
                  <p>Desired and available replicas</p>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Ready</th>
                      <th>Updated</th>
                      <th>Available</th>
                    </tr>
                  </thead>

                  <tbody>
                    {deployments.map((deployment) => (
                      <tr key={deployment.name}>
                        <td className="resource-name">{deployment.name}</td>
                        <td>
                          <span className="badge success">
                            <span className="status-dot" />
                            {deployment.ready}
                          </span>
                        </td>
                        <td>{deployment.updated}</td>
                        <td>{deployment.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeView === 'resources' && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Resource usage</h3>
                  <p>Current workload consumption in {namespace}</p>
                </div>
              </div>

              <div className="resource-grid">
                <div className="resource-card">
                  <div className="resource-card-heading">
                    <span>CPU</span>
                    <strong>{totalCpu}%</strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-value"
                      style={{ width: `${Math.min(totalCpu, 100)}%` }}
                    />
                  </div>
                  <small>Requested workload CPU</small>
                </div>

                <div className="resource-card">
                  <div className="resource-card-heading">
                    <span>Memory</span>
                    <strong>{totalMemory} Mi</strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-value"
                      style={{
                        width: `${Math.min((totalMemory / 1024) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <small>1024 Mi available in demo cluster</small>
                </div>
              </div>
            </section>
          )}

          <div className="footer-status">
            <span>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <span>Data source: simulated Kubernetes API</span>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App