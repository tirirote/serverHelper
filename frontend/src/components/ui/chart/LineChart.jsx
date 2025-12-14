import React from 'react';
import styles from './LineChart.module.css';

// Very small, dependency-free SVG line chart.
// Props: data = [{label, value}] or [{label, maintenance, consumption, total}], width, height
const LineChart = ({ data = [], width = 640, height = 240, stroke = '#a2fa0c' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.empty}>No hay datos de simulación</div>
    );
  }

  // Determine keys (series) available
  const seriesKeys = Object.keys(data[0] || {}).filter(k => k !== 'label' && typeof data[0][k] === 'number');

  // If only 'value' key exists, keep compatibility and plot single series
  const keys = seriesKeys.length ? seriesKeys : (data[0].value ? ['value'] : []);

  // Flatten all values to compute global min/max
  let allValues = [];
  data.forEach(d => {
    keys.forEach(k => {
      const v = d[k];
      if (typeof v === 'number') allValues.push(v);
    });
  });

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const pad = 24; // padding for axes
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const x = (i) => pad + (i / (data.length - 1 || 1)) * innerW;
  const y = (v) => pad + (1 - ((v - min) / ((max - min) || 1))) * innerH;

  const colors = ['#a2fa0c', '#0cc7ff', '#ffa500', '#ff6b6b'];

  const seriesPoints = keys.map((k) => ({
    key: k,
    color: colors[keys.indexOf(k) % colors.length],
    points: data.map((d, i) => `${x(i)},${y(d[k])}`).join(' ')
  }));

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

        {/* series lines */}
        {seriesPoints.map((s) => (
          <polyline
            key={s.key}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            points={s.points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* points (for each series, we draw smaller points) */}
        {keys.map((k, seriesIndex) => (
          data.map((d, i) => (
            <circle key={`${k}-${i}`} cx={x(i)} cy={y(d[k])} r={2.5} fill={colors[seriesIndex % colors.length]} />
          ))
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={height - 6} className={styles.xLabel}>{d.label}</text>
        ))}

        {/* Y min/max labels */}
        <text x={8} y={pad + innerH} className={styles.yLabel}>{min.toFixed(2)}</text>
        <text x={8} y={pad - 4} className={styles.yLabel}>{max.toFixed(2)}</text>

        {/* legend */}
        <g transform={`translate(${width - pad - 140}, ${pad})`}>
          {keys.map((k, i) => (
            <g key={k} transform={`translate(0, ${i * 18})`}>
              <rect x={0} y={-10} width={12} height={8} fill={colors[i % colors.length]} />
              <text x={18} y={-2} className={styles.yLabel}>{k}</text>
            </g>
          ))}
        </g>

      </svg>
    </div>
  );
};

export default LineChart;
