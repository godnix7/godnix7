/**
 * Recorded outputs of real UniMonitor runs on the live Vercel Linux sandbox, shown in "Examples" mode
 * and as a fallback if the live sandbox is unavailable.
 */
export const UNIMONITOR_EXAMPLES: Record<string, { recordedOn: string; output: string }> = {
  "cpu": {
    "recordedOn": "2026-11-17 19:31 UTC",
    "output": "\nCPU MONITORING\n----------------------------------------------------------------------------------------\n Processor          : Intel(R) Xeon(R) Processor @ 2.50GHz\n CPU cores           : 2\n CPU utilization     : 0.5% [HEALTHY]\n Load average (1/5/15): 0.08 0.02 0.01\n\nTop 5 CPU-consuming processes:\n    PID USER          %CPU  %MEM COMMAND          \n      8 sbx_user1051   5.1   4.0 node             \n      2 sbx_user1051   1.0   0.2 bootstrap        \n      1 root           0.0   0.0 init             \n     47 sbx_user1051   0.0   0.2 bash             \n     69 sbx_user1051   0.0   0.1 bash"
  },
  "cpuinfo": {
    "recordedOn": "2026-11-17 19:33 UTC",
    "output": "model name\t: Intel(R) Xeon(R) Processor @ 2.50GHz\nprocessors: 2"
  },
  "date": {
    "recordedOn": "2026-11-17 19:33 UTC",
    "output": "Tue Nov 17 19:33:10 UTC 2026"
  },
  "df": {
    "recordedOn": "2026-11-17 19:33 UTC",
    "output": "Filesystem                    Size  Used Avail Use% Mounted on\n/var/rootfs/operator/runtime  191G  188G     0 100% /\n/dev/vdb                      1.5G  2.4M  1.4G   1% /etc/hosts\ntmpfs                          64M     0   64M   0% /dev\n/dev/vdd                      525M   28K  514M   1% /tmp\n/dev/root                     9.7G  530M  9.2G   6% /etc/passwd\n/dev/vdc                      2.4M  2.4M     0 100% /opt"
  },
  "disk": {
    "recordedOn": "2026-11-17 19:31 UTC",
    "output": "\nDISK MONITORING\n----------------------------------------------------------------------------------------\nFILESYSTEM               TYPE              SIZE      USED     AVAIL   USE% MOUNT\n/dev/vdb                 ext4           1486216      2424   1467408     1% /etc/hosts\n/dev/vdd                 ext4            537560        24    525700     1% /tmp\n/dev/root                ext4          10153236    542452   9594400     6% /etc/passwd\n\nHighest mounted filesystem usage: 6% [HEALTHY]\n\nlsblk is unavailable; block device listing omitted."
  },
  "free": {
    "recordedOn": "2026-11-17 19:33 UTC",
    "output": "MemTotal:        2333240 kB\nMemFree:         2119060 kB\nMemAvailable:    2119744 kB\nSwapTotal:             0 kB\nSwapFree:              0 kB"
  },
  "health": {
    "recordedOn": "2026-11-17 19:32 UTC",
    "output": "\nSYSTEM HEALTH ANALYSIS\n----------------------------------------------------------------------------------------\n CPU status      : HEALTHY   6.2%\n Memory status   : HEALTHY   8.9%\n Disk status     : HEALTHY   6%\n Swap status     : N/A       not configured\n Load status     : HEALTHY   0.04 0.01 0.00 (cores: 2)\n Utility status  : HEALTHY  \n\n Overall status  : HEALTHY\n\nRecommendations:\n - No action indicated by the available measurements."
  },
  "help": {
    "recordedOn": "2026-11-17 19:32 UTC",
    "output": "UniMonitor - Linux system monitoring and diagnostics\n\nUsage:\n  ./main.sh             Open the interactive dashboard\n  ./main.sh --report    Generate a complete report and exit\n  ./main.sh --version   Print the version\n  ./main.sh --help      Show this help\n\nSet NO_COLOR=1 to disable terminal colors. Configuration is read from\nconfig/settings.conf, or from the path in UNIMONITOR_CONFIG."
  },
  "loadavg": {
    "recordedOn": "2026-11-17 19:33 UTC",
    "output": "0.01 0.01 0.00 1/132 1054"
  },
  "ls": {
    "recordedOn": "2026-11-17 19:33 UTC",
    "output": "total 9\ndrwxr-xr-x 6 root root  120 Nov 17 19:31 .\ndrwxr-xr-x 5 root root   94 Nov 17 19:31 ..\n-rwxr-xr-x 1 root root 1080 Oct 20  2018 LICENSE\ndrwxr-xr-x 2 root root   36 Nov 17 19:31 config\ndrwxr-xr-x 2 root root   61 Nov 17 19:31 demo-bin\n-rwxr-xr-x 1 root root 4503 Oct 20  2018 main.sh\ndrwxr-xr-x 2 root root  231 Nov 17 19:31 modules\n-rwxr-xr-x 1 root root 2675 Oct 20  2018 run-op.sh\ndrwxr-xr-x 2 root root   87 Nov 17 19:31 utils"
  },
  "memory": {
    "recordedOn": "2026-11-17 19:31 UTC",
    "output": "\nMEMORY MONITORING\n----------------------------------------------------------------------------------------\n RAM total                  : 2.23 GiB\n RAM used (total - available): 208.3 MiB\n RAM available              : 2.02 GiB\n RAM free                   : 2.02 GiB\n RAM utilization            : 9.1% [HEALTHY]\n Swap                       : not configured"
  },
  "network": {
    "recordedOn": "2026-11-17 19:32 UTC",
    "output": "\nNETWORK OVERVIEW\n----------------------------------------------------------------------------------------\n\nNETWORK OVERVIEW\n----------------------------------------------------------------------------------------\nInterfaces and addresses:\nlo               UNKNOWN        127.0.0.1/8\nvint_runtime     UNKNOWN        127.0.0.1 169.254.100.6 \n\nDefault route: default via 169.254.100.5 dev vint_runtime\nLocal addresses: 169.254.100.6 \n\nListening ports:\nNetid  State    Local Address:Port           Peer Address:Port\ntcp    LISTEN   127.0.0.1:42669              *:*"
  },
  "osrelease": {
    "recordedOn": "2026-11-17 19:33 UTC",
    "output": "NAME=\"Amazon Linux\"\nVERSION=\"2023\"\nID=\"amzn\"\nID_LIKE=\"fedora\"\nVERSION_ID=\"2023\"\nPLATFORM_ID=\"platform:al2023\"\nPRETTY_NAME=\"Amazon Linux 2023.12.20261109\"\nANSI_COLOR=\"0;33\"\nCPE_NAME=\"cpe:2.3:o:amazon:amazon_linux:2023\"\nHOME_URL=\"https://aws.amazon.com/linux/amazon-linux-2023/\"\nDOCUMENTATION_URL=\"https://docs.aws.amazon.com/linux/\"\nSUPPORT_URL=\"https://aws.amazon.com/premiumsupport/\"\nBUG_REPORT_URL=\"https://github.com/amazonlinux/amazon-linux-2023\"\nVENDOR_NAME=\"AWS\"\nVENDOR_URL=\"https://aws.amazon.com/\"\nSUPPORT_END=\"2029-06-30\"\nVARIANT_ID=\"202611100952-003dcc96-13e0-4bc0-97cd-d8cd7ad35839\""
  },
  "overview": {
    "recordedOn": "2026-11-17 19:31 UTC",
    "output": "+--------------------------------------------------------------------------------------+\n|                                   UNIMONITOR v1.0                                    |\n|                           LINUX SYSTEM MONITORING TOOLKIT                            |\n| sbx_user1051 @ 169.254.29.115  |  Amazon Linux 2023.12.20261109  |  0h 2m            |\n+--------------------------------------------------------------------------------------+\n\nSYSTEM HEALTH ANALYSIS\n----------------------------------------------------------------------------------------\n CPU status      : HEALTHY   1.5%\n Memory status   : HEALTHY   9.0%\n Disk status     : HEALTHY   6%\n Swap status     : N/A       not configured\n Load status     : HEALTHY   0.00 0.00 0.00 (cores: 2)\n Utility status  : HEALTHY  \n\n Overall status  : HEALTHY\n\nRecommendations:\n - No action indicated by the available measurements."
  },
  "processes": {
    "recordedOn": "2026-11-17 19:32 UTC",
    "output": "\nTOP PROCESSES BY CPU\n----------------------------------------------------------------------------------------\n    PID    PPID USER         STAT  %CPU  %MEM COMMAND          \n      8       2 sbx_user1051 S      1.6   4.1 node             \n      2       0 sbx_user1051 S      0.4   0.2 bootstrap        \n      1       0 root         S      0.0   0.0 init             \n    208       8 sbx_user1051 S      0.0   0.2 bash             \n    216     208 sbx_user1051 S      0.0   0.1 bash             \n    217     208 sbx_user1051 S      0.0   0.1 head             \n    218     216 sbx_user1051 S      0.0   0.1 bash             \n    222     218 sbx_user1051 S      0.0   0.1 bash             \n    223     222 sbx_user1051 S      0.0   0.1 bash             \n    224     222 sbx_user1051 S      0.0   0.1 awk              \n\nTOP PROCESSES BY MEMORY\n----------------------------------------------------------------------------------------\n    PID    PPID USER         STAT  %CPU  %MEM COMMAND          \n      8       2 sbx_user1051 S      1.6   4.1 node             \n      2       0 sbx_user1051 S      0.4   0.2 bootstrap        \n    208       8 sbx_user1051 S      0.0   0.2 bash             \n    320     208 sbx_user1051 S      0.0   0.1 bash             \n    321     208 sbx_user1051 S      0.0   0.1 head             \n    322     320 sbx_user1051 S      0.0   0.1 bash             \n    326     322 sbx_user1051 S      0.0   0.1 bash             \n    327     326 sbx_user1051 S      0.0   0.1 bash             \n    328     326 sbx_user1051 S      0.0   0.1 awk              \n      1       0 root         S      0.0   0.0 init"
  },
  "pwd": {
    "recordedOn": "2026-11-17 19:33 UTC",
    "output": "/var/task/project-hub/unimonitor"
  },
  "report": {
    "recordedOn": "2026-11-17 19:32 UTC",
    "output": "UNIMONITOR SYSTEM REPORT\nGenerated: 2026-11-17 19:32:27 UTC\nHost: 169.254.80.89\n\nSYSTEM INFORMATION\n----------------------------------------------------------------------------------------\n Distribution        : Amazon Linux 2023.12.20261109\n Distribution ID     : amzn\n Distribution version: 2023\n Kernel              : Linux 5.10.255-271-319.1120.amzn2.x86_64\n Hostname            : 169.254.80.89\n Architecture        : x86_64\n Current user        : sbx_user1051\n Date and time       : 2026-11-17 19:32:27 UTC\n Uptime              : 0 days, 0 hours, 0 minutes\n Available CPUs      : 2\n Login shell         : /bin/bash\n\nCPU MONITORING\n----------------------------------------------------------------------------------------\n Processor          : Intel(R) Xeon(R) Processor @ 2.50GHz\n CPU cores           : 2\n CPU utilization     : 1.0% [HEALTHY]\n Load average (1/5/15): 0.04 0.01 0.00\n\nTop 5 CPU-consuming processes:\n    PID USER          %CPU  %MEM COMMAND          \n      8 sbx_user1051   1.1   3.8 node             \n      2 sbx_user1051   0.4   0.2 bootstrap        \n      1 root           0.0   0.0 init             \n    488 sbx_user1051   0.0   0.2 bash             \n    494 sbx_user1051   0.0   0.1 bash             \n\nMEMORY MONITORING\n----------------------------------------------------------------------------------------\n RAM total                  : 2.23 GiB\n RAM used (total - available): 206.6 MiB\n RAM available              : 2.02 GiB\n RAM free                   : 2.02 GiB\n RAM utilization            : 9.1% [HEALTHY]\n Swap                       : not configured\n\nDISK MONITORING\n----------------------------------------------------------------------------------------\nFILESYSTEM               TYPE              SIZE      USED     AVAIL   USE% MOUNT\n/dev/vdb                 ext4           1486216      2424   1467408     1% /etc/hosts\n/dev/vdd                 ext4            537560        28    525696     1% /tmp\n/dev/root                ext4          10153236    542452   9594400     6% /etc/passwd\n\nHighest mounted filesystem usage: 6% [HEALTHY]\n\nlsblk is unavailable; block device listing omitted.\n\nTOP PROCESSES BY CPU\n----------------------------------------------------------------------------------------\n    PID    PPID USER         STAT  %CPU  %MEM COMMAND          \n      8       2 sbx_user1051 S      1.1   3.8 node             \n      2       0 sbx_user1051 S      0.5   0.2 bootstrap        \n      1       0 root         S      0.0   0.0 init             \n    488       8 sbx_user1051 S      0.0   0.2 bash             \n    494     488 sbx_user1051 S      0.0   0.1 bash             \n    687     494 sbx_user1051 S      0.0   0.1 bash             \n    688     494 sbx_user1051 S      0.0   0.1 head             \n    689     687 sbx_user1051 S      0.0   0.1 bash             \n    693     689 sbx_user1051 S      0.0   0.1 bash             \n    694     693 sbx_user1051 S      0.0   0.1 bash             \n\nTOP PROCESSES BY MEMORY\n----------------------------------------------------------------------------------------\n    PID    PPID USER         STAT  %CPU  %MEM COMMAND          \n      8       2 sbx_user1051 S      1.1   3.8 node             \n      2       0 sbx_user1051 S      0.5   0.2 bootstrap        \n    488       8 sbx_user1051 S      0.0   0.2 bash             \n    494     488 sbx_user1051 S      0.0   0.1 bash             \n    800     494 sbx_user1051 S      0.0   0.1 bash             \n    801     494 sbx_user1051 S      0.0   0.1 head             \n    802     800 sbx_user1051 S      0.0   0.1 bash             \n    806     802 sbx_user1051 S      0.0   0.1 bash             \n    807     806 sbx_user1051 S      0.0   0.1 bash             \n    808     806 sbx_user1051 S      0.0   0.1 awk              \n\nNETWORK OVERVIEW\n----------------------------------------------------------------------------------------\nInterfaces and addresses:\nlo               UNKNOWN        127.0.0.1/8\nvint_runtime     UNKNOWN        127.0.0.1 169.254.100.6 \n\nDefault route: default via 169.254.100.5 dev vint_runtime\nLocal addresses: 169.254.100.6 \n\nListening ports:\nNetid  State    Local Address:Port           Peer Address:Port\ntcp    LISTEN   127.0.0.1:42669              *:*\n\nSYSTEM HEALTH ANALYSIS\n----------------------------------------------------------------------------------------\n CPU status      : HEALTHY   0.5%\n Memory status   : HEALTHY   9.0%\n Disk status     : HEALTHY   6%\n Swap status     : N/A       not configured\n Load status     : HEALTHY   0.04 0.01 0.00 (cores: 2)\n Utility status  : HEALTHY  \n\n Overall status  : HEALTHY\n\nRecommendations:\n - No action indicated by the available measurements.\n\nEND OF REPORT"
  },
  "sysinfo": {
    "recordedOn": "2026-11-17 19:31 UTC",
    "output": "\nSYSTEM INFORMATION\n----------------------------------------------------------------------------------------\n Distribution        : Amazon Linux 2023.12.20261109\n Distribution ID     : amzn\n Distribution version: 2023\n Kernel              : Linux 5.10.255-271-319.1120.amzn2.x86_64\n Hostname            : 169.254.80.89\n Architecture        : x86_64\n Current user        : sbx_user1051\n Date and time       : 2026-11-17 19:31:39 UTC\n Uptime              : 0 days, 0 hours, 0 minutes\n Available CPUs      : 2\n Login shell         : /bin/bash"
  },
  "uname": {
    "recordedOn": "2026-11-17 19:32 UTC",
    "output": "Linux 169.254.80.89 5.10.255-271-319.1120.amzn2.x86_64 #1 SMP Fri Oct 16 12:46:31 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux"
  },
  "uptime": {
    "recordedOn": "2026-11-17 19:33 UTC",
    "output": "up 1 min"
  },
  "version": {
    "recordedOn": "2026-11-17 19:32 UTC",
    "output": "UniMonitor 1.0"
  },
  "whoami": {
    "recordedOn": "2026-11-17 19:32 UTC",
    "output": "sbx_user1051"
  }
};
