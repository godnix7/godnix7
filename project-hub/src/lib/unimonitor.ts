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
  { id: "whoami", label: "whoami", description: "Current user", shell: true },
  { id: "uname", label: "uname -a", description: "Kernel and architecture", shell: true },
  { id: "uptime", label: "uptime", description: "Uptime and load", shell: true },
  { id: "date", label: "date", description: "Server date and time", shell: true },
  { id: "df", label: "df -h", description: "Disk usage", shell: true },
  { id: "free", label: "free -h", description: "Memory usage", shell: true },
  { id: "osrelease", label: "cat /etc/os-release", description: "Operating system", shell: true },
  { id: "cpuinfo", label: "cat /proc/cpuinfo", description: "CPU model and count", shell: true },
  { id: "loadavg", label: "cat /proc/loadavg", description: "Load averages", shell: true },
  { id: "ls", label: "ls -la", description: "UniMonitor files", shell: true },
  { id: "pwd", label: "pwd", description: "Working directory", shell: true },
] as const;

export type UnimonitorOp = (typeof UNIMONITOR_OPS)[number]["id"];

export function isUnimonitorOp(value: string): value is UnimonitorOp {
  return UNIMONITOR_OPS.some((o) => o.id === value);
}
