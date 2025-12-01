import React from 'react';
import styles from './LineChart.module.css';

// Very small, dependency-free SVG line chart.
// Props: data = [{label, value}], width, height, stroke
const LineChart = ({ data = [], width = 640, height = 240, stroke = '#a2fa0c' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.empty}>No hay datos de simulación</div>
    );
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 24; // padding for axes
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const x = (i) => pad + (i / (data.length - 1 || 1)) * innerW;
  const y = (v) => pad + (1 - ((v - min) / ((max - min) || 1))) * innerH;

  const points = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');

  return (
    <div className={styles.chart} style={{ width }}>
      <svg width={width} height={height}>
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((g, idx) => (
          <line key={idx}
            x1={pad} x2={width - pad}
            y1={pad + g * innerH} y2={pad + g * innerH}
            stroke="#4a4c41" strokeWidth="1" opacity="0.6" />
        ))}

        {/* line */}
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* points */}
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.value)} r={3.5} fill={stroke} />
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={height - 6} className={styles.xLabel}>{d.label}</text>
        ))}

        {/* Y min/max labels */}
        <text x={8} y={pad + innerH} className={styles.yLabel}>{min.toFixed(2)}</text>
        <text x={8} y={pad - 4} className={styles.yLabel}>{max.toFixed(2)}</text>
      </svg>
    </div>
  );
};

export default LineChart;
