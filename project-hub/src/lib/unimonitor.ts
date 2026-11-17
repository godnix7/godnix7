/** Allow-listed UniMonitor views exposed by the website demo (must match unimonitor/run-op.sh). */
export const UNIMONITOR_OPS = [
  { id: "overview", label: "dashboard", description: "Header and overall system health" },
  { id: "sysinfo", label: "sysinfo", description: "Operating system, kernel, uptime and hardware" },
  { id: "cpu", label: "cpu", description: "CPU usage sample, cores and load averages" },
  { id: "memory", label: "memory", description: "RAM and swap usage" },
  { id: "disk", label: "disk", description: "Mounted filesystems and usage" },
  { id: "processes", label: "processes", description: "Top processes by CPU and memory" },
  { id: "network", label: "network", description: "Interfaces and addresses" },
  { id: "health", label: "health", description: "Threshold-based health analysis" },
  { id: "report", label: "report", description: "Full timestamped system report" },
  { id: "version", label: "--version", description: "Print the version" },
  { id: "help", label: "--help", description: "Command-line usage" },
] as const;

export type UnimonitorOp = (typeof UNIMONITOR_OPS)[number]["id"];

export function isUnimonitorOp(value: string): value is UnimonitorOp {
  return UNIMONITOR_OPS.some((o) => o.id === value);
}
