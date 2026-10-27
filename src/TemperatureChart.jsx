import React, { useState } from "react";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
const time = (value) =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
export default function TemperatureChart({ result, onEvidence }) {
  const [hover, setHover] = useState(null),
    points = result.chart;
  const temperatures = points
    .flatMap((p) => [p.rawC, p.correctedC, p.referenceC])
    .filter(Number.isFinite);
  const min = Math.min(0, result.shipment.min_temp_c - 1, ...temperatures),
    max = Math.max(result.shipment.max_temp_c + 3, ...temperatures) + 1;
  const left = 40,
    right = 710,
    top = 20,
    bottom = 178,
    start = Date.parse(result.shipment.investigation_window_start),
    end = Date.parse(result.shipment.investigation_window_end);
  const x = (t) =>
      left + ((Date.parse(t) - start) / (end - start || 1)) * (right - left),
    y = (v) => bottom - ((v - min) / (max - min)) * (bottom - top);
  function path(key) {
    let pen = false;
    let previousTime = null;
    const cadenceMs = result.shipment.expected_interval_minutes * 60_000;
    return points
      .map((p) => {
        const pointTime = Date.parse(p.timestamp);
        if (previousTime !== null && pointTime - previousTime > cadenceMs * 1.5)
          pen = false;
        previousTime = pointTime;
        if (!Number.isFinite(p[key])) {
          pen = false;
          return "";
        }
        const command = pen ? "L" : "M";
        pen = true;
        return `${command}${x(p.timestamp)},${y(p[key])}`;
      })
      .join(" ");
  }
  const hasReferences = points.some((p) => Number.isFinite(p.referenceC));
  return (
    <div className="chart-wrap" onMouseLeave={() => setHover(null)}>
      <svg
        viewBox="0 0 750 215"
        role="img"
        aria-label={`Raw peak ${result.metrics.rawPeakC} degrees, corrected peak ${result.metrics.correctedPeakC} degrees. ${result.coverage.percent} percent of scheduled observations available.`}
      >
        <defs>
          <linearGradient id="chartfill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ddefe4" stopOpacity=".6" />
            <stop offset="100%" stopColor="#ddefe4" stopOpacity=".15" />
          </linearGradient>
        </defs>
        <rect
          x={left}
          width={right - left}
          y={y(result.shipment.max_temp_c)}
          height={y(result.shipment.min_temp_c) - y(result.shipment.max_temp_c)}
          fill="url(#chartfill)"
        />
        {Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4).map(
          (v) => (
            <g key={v}>
              <line
                x1={left}
                x2={right}
                y1={y(v)}
                y2={y(v)}
                stroke="#e9ecee"
                strokeDasharray="3 4"
              />
              <text x="25" y={y(v) + 4} textAnchor="end">
                {v.toFixed(0)}°
              </text>
            </g>
          ),
        )}
        <line
          x1={left}
          x2={right}
          y1={y(result.shipment.max_temp_c)}
          y2={y(result.shipment.max_temp_c)}
          stroke="#a0bea7"
          strokeDasharray="5 5"
        />
        <path
          d={path("rawC")}
          fill="none"
          stroke="#9faebd"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <path
          d={path("correctedC")}
          fill="none"
          stroke="#315b57"
          strokeWidth="2.5"
        />
        {points.map((p, i) => (
          <g
            key={p.rowId || i}
            role="button"
            tabIndex={0}
            aria-label={`Inspect reading at ${time(p.timestamp)}`}
            onClick={() => onEvidence(p.rowId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEvidence(p.rowId);
              }
            }}
            onMouseEnter={() => setHover(p)}
          >
            <circle
              cx={x(p.timestamp)}
              cy={y(p.correctedC ?? p.rawC)}
              r="12"
              fill="transparent"
            />
            <circle
              cx={x(p.timestamp)}
              cy={y(p.correctedC ?? p.rawC)}
              r="4.5"
              fill={
                !Number.isFinite(p.correctedC)
                  ? "#9faebd"
                  : p.correctedC > result.shipment.max_temp_c ||
                      p.correctedC < result.shipment.min_temp_c
                    ? "#cf7546"
                    : "#315b57"
              }
              stroke="white"
              strokeWidth="2"
            />
            {Number.isFinite(p.referenceC) && (
              <rect
                x={x(p.timestamp) - 4}
                y={y(p.referenceC) - 4}
                width="8"
                height="8"
                fill="#6e8eb4"
                stroke="white"
                strokeWidth="1.5"
                transform={`rotate(45 ${x(p.timestamp)} ${y(p.referenceC)})`}
              />
            )}
            <text x={x(p.timestamp)} y="202" textAnchor="middle">
              {time(p.timestamp)}
            </text>
          </g>
        ))}
      </svg>
      {hover && (
        <div className="chart-tooltip">
          {time(hover.timestamp)} UTC · Raw {hover.rawC}°C · Corrected{" "}
          {hover.correctedC ?? "unresolved"}°C
          {Number.isFinite(hover.referenceC) &&
            ` · Reference ${hover.referenceC}°C`}
          <button onClick={() => onEvidence(hover.rowId)}>
            Source
            <ArrowUpRight size={12} />
          </button>
        </div>
      )}
      {hasReferences && (
        <div className="reference-note">
          <i />
          Blue diamonds: independent reference observations
        </div>
      )}
      {(result.coverage.percent < 100 ||
        points.some((p) => !Number.isFinite(p.correctedC))) && (
        <div className="chart-gap">
          <AlertTriangle size={13} />
          Gaps represent missing observations or unresolved calibration. Lines
          do not prove continuous temperature.
        </div>
      )}
    </div>
  );
}
