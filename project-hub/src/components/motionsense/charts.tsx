"use client";

/** Small dependency-free SVG charts used across the MotionSense site. */
const AX = "#8a94a3";
const GRID = "#e6eaf0";

type Series = { name: string; color: string; values: (number | null)[]; dashed?: boolean };

export function LineChart({
  x, series, yMin = 0, yMax = 1, yFmt = (v: number) => `${Math.round(v * 100)}%`, xLabel, height = 260, threshold,
}: { x: number[]; series: Series[]; yMin?: number; yMax?: number; yFmt?: (v: number) => string; xLabel?: string; height?: number; threshold?: number }) {
  const W = 640, H = height, L = 48, R = 12, T = 34, B = 36;
  const xmin = Math.min(...x), xmax = Math.max(...x, xmin + 1);
  const sx = (v: number) => L + ((v - xmin) / (xmax - xmin)) * (W - L - R);
  const sy = (v: number) => T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B);
  const ticks = Array.from({ length: 5 }, (_, i) => yMin + (i * (yMax - yMin)) / 4);
  const xticks = Array.from({ length: 6 }, (_, i) => xmin + (i * (xmax - xmin)) / 5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="msa-chart" role="img">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={sy(t)} y2={sy(t)} stroke={GRID} />
          <text x={L - 8} y={sy(t) + 4} textAnchor="end" fontSize="10" fill={AX}>{yFmt(t)}</text>
        </g>
      ))}
      {xticks.map((t) => (
        <text key={t} x={sx(t)} y={H - B + 16} textAnchor="middle" fontSize="10" fill={AX}>{Number.isInteger(t) ? t : t.toFixed(0)}</text>
      ))}
      {xLabel && <text x={(L + W - R) / 2} y={H - 4} textAnchor="middle" fontSize="11" fill={AX}>{xLabel}</text>}
      {threshold != null && (
        <g>
          <line x1={L} x2={W - R} y1={sy(threshold)} y2={sy(threshold)} stroke="#9aa4b2" strokeDasharray="4 4" />
          <text x={L + 4} y={sy(threshold) - 4} fontSize="9" fill={AX}>threshold {threshold.toFixed(2)}</text>
        </g>
      )}
      {series.map((s) => {
        const pts = s.values.map((v, i) => (v == null ? null : `${sx(x[i])},${sy(v)}`)).filter(Boolean).join(" ");
        return <polyline key={s.name} points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dashed ? "6 4" : undefined} />;
      })}
      <g transform={`translate(${L}, 12)`}>
        {series.map((s, i) => (
          <g key={s.name} transform={`translate(${i * 128}, 0)`}>
            <line x1="0" x2="16" y1="0" y2="0" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dashed ? "4 3" : undefined} />
            <text x="21" y="4" fontSize="10" fill="#3b4656">{s.name}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function ProbBars({ labels, values, colors, highlight }: { labels: string[]; values: number[]; colors: string[]; highlight?: number }) {
  return (
    <div className="msa-bars">
      {labels.map((l, i) => (
        <div key={l} className={`msa-bar${highlight === i ? " top" : ""}`}>
          <span>{l}</span>
          <div><i style={{ width: `${Math.max(0, Math.min(1, values[i] ?? 0)) * 100}%`, background: highlight === i ? colors[i] : "#cfd6df" }} /></div>
          <b>{((values[i] ?? 0) * 100).toFixed(1)}%</b>
        </div>
      ))}
    </div>
  );
}

export function TimelineBar({ segments, duration, legend, cursor }: { segments: { start: number; end: number; color: string; label: string }[]; duration: number; legend: { label: string; color: string }[]; cursor?: number }) {
  const W = 640, H = 92, L = 10, R = 10;
  const sx = (t: number) => L + (t / Math.max(duration, 0.001)) * (W - L - R);
  const ticks = Array.from({ length: Math.floor(duration / 5) + 1 }, (_, i) => i * 5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="msa-chart" role="img">
      <g transform="translate(10, 10)">
        {legend.map((l, i) => (
          <g key={l.label} transform={`translate(${(i % 7) * 90}, 0)`}>
            <rect width="9" height="9" y="-7" fill={l.color} />
            <text x="13" y="1" fontSize="9.5" fill="#3b4656">{l.label}</text>
          </g>
        ))}
      </g>
      {segments.map((s, i) => (
        <rect key={i} x={sx(s.start)} y={26} width={Math.max(1, sx(s.end) - sx(s.start) - 1)} height={30} fill={s.color}>
          <title>{`${s.label}: ${s.start.toFixed(1)}–${s.end.toFixed(1)} s`}</title>
        </rect>
      ))}
      {cursor != null && <line x1={sx(cursor)} x2={sx(cursor)} y1={20} y2={62} stroke="#0f1b2d" strokeWidth="2" />}
      {ticks.map((t) => (
        <text key={t} x={sx(t)} y={78} textAnchor="middle" fontSize="10" fill={AX}>{t}</text>
      ))}
      <text x={W / 2} y={H - 1} textAnchor="middle" fontSize="10" fill={AX}>Time (s)</text>
    </svg>
  );
}

export function ConfusionMatrix({ matrix, labels }: { matrix: number[][]; labels: string[] }) {
  return (
    <div className="msa-cm" style={{ gridTemplateColumns: `120px repeat(${labels.length}, 1fr)` }}>
      <span />
      {labels.map((l) => <span key={l} className="msa-cm-h">{l}</span>)}
      {matrix.map((row, i) => {
        const total = row.reduce((a, b) => a + b, 0) || 1;
        return [
          <span key={`r${i}`} className="msa-cm-r">{labels[i]}</span>,
          ...row.map((v, j) => {
            const p = v / total;
            return (
              <span key={`${i}-${j}`} className="msa-cm-c" style={{ background: `rgba(19, 35, 63, ${0.06 + p * 0.94})`, color: p > 0.45 ? "#fff" : "#13233f" }}>
                <b>{v}</b>
                <small>{Math.round(p * 100)}%</small>
              </span>
            );
          }),
        ];
      })}
    </div>
  );
}

export function GroupedBars({ labels, groups }: { labels: string[]; groups: { name: string; color: string; values: number[] }[] }) {
  const W = 640, H = 250, L = 40, R = 8, T = 28, B = 46;
  const bw = (W - L - R) / labels.length;
  const inner = (bw * 0.75) / groups.length;
  const sy = (v: number) => T + (1 - v) * (H - T - B);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="msa-chart" role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={sy(t)} y2={sy(t)} stroke={GRID} />
          <text x={L - 6} y={sy(t) + 4} textAnchor="end" fontSize="10" fill={AX}>{t * 100}%</text>
        </g>
      ))}
      {labels.map((l, i) => (
        <g key={l}>
          {groups.map((g, k) => (
            <rect key={g.name} x={L + i * bw + bw * 0.125 + k * inner} y={sy(g.values[i])} width={inner - 2} height={sy(0) - sy(g.values[i])} fill={g.color}>
              <title>{`${l} · ${g.name}: ${(g.values[i] * 100).toFixed(1)}%`}</title>
            </rect>
          ))}
          <text x={L + i * bw + bw / 2} y={H - B + 16} textAnchor="middle" fontSize="10" fill="#3b4656">{l.length > 14 ? `${l.slice(0, 13)}…` : l}</text>
        </g>
      ))}
      <g transform={`translate(${W - R - groups.length * 90}, 12)`}>
        {groups.map((g, i) => (
          <g key={g.name} transform={`translate(${i * 90}, 0)`}>
            <rect width="9" height="9" y="-7" fill={g.color} />
            <text x="13" y="1" fontSize="10" fill="#3b4656">{g.name}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function StackedBars({ labels, parts }: { labels: string[]; parts: { name: string; color: string; values: number[] }[] }) {
  const max = Math.max(...labels.map((_, i) => parts.reduce((a, p) => a + p.values[i], 0)));
  return (
    <div className="msa-stack">
      <div className="msa-legend">{parts.map((p) => <span key={p.name}><i style={{ background: p.color }} />{p.name}</span>)}</div>
      {labels.map((l, i) => (
        <div key={l} className="msa-stack-row">
          <span>{l}</span>
          <div>
            {parts.map((p) => (
              <i key={p.name} title={`${p.name}: ${p.values[i]}`} style={{ width: `${(p.values[i] / max) * 100}%`, background: p.color }}>{p.values[i]}</i>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
