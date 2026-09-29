import { useState, useEffect } from "react";
import React from "react";
import "./gauge.css";

/* ---------- Hình học ---------- */
const CX = 100;
const CY = 100;
const RADIUS = 80; // bán kính đường giữa của dải màu
const STROKE = 14; // độ dày dải màu
const START_ANGLE = -135; // 0° = hướng lên trên, chiều kim đồng hồ
const SWEEP = 270; // 3/4 hình tròn
const SEGMENTS = 135; // số đoạn để tạo dải màu chuyển sắc

const polar = (r, deg) => {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)];
};

const arcPath = (r, a0, a1) => {
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

// Đường bao khép kín của dải màu (2 cung + 2 đầu bo tròn)
const bandOutline = (a0, a1) => {
  const ro = RADIUS + STROKE / 2;
  const ri = RADIUS - STROKE / 2;
  const cap = STROKE / 2;
  const [ox0, oy0] = polar(ro, a0);
  const [ox1, oy1] = polar(ro, a1);
  const [ix0, iy0] = polar(ri, a0);
  const [ix1, iy1] = polar(ri, a1);
  return [
    `M ${ox0} ${oy0}`,
    `A ${ro} ${ro} 0 1 1 ${ox1} ${oy1}`,
    `A ${cap} ${cap} 0 0 1 ${ix1} ${iy1}`,
    `A ${ri} ${ri} 0 1 0 ${ix0} ${iy0}`,
    `A ${cap} ${cap} 0 0 1 ${ox0} ${oy0}`,
    "Z",
  ].join(" ");
};

/* ---------- Màu: xanh (min) - vàng (giữa) - đỏ (max) ---------- */
const GREEN = [34, 197, 94];
const YELLOW = [250, 204, 21];
const RED = [239, 68, 68];

const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

const colorAt = (t) => {
  const c =
    t < 0.5 ? lerp(GREEN, YELLOW, t * 2) : lerp(YELLOW, RED, (t - 0.5) * 2);
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const fmt = (n) => Number(n.toFixed(2)).toString();

/* ---------- Cỡ chữ (đơn vị viewBox): số vạch < title < value ---------- */
const TICK_FONT = 7.5;
const VALUE_FONT = 20;
const UNIT_FONT = 9;

/* ---------- Hook: lấy màu --text theo theme (dùng chung Gauge & SimGauge) ---------- */
const useThemeColors = () => {
  const [theme, setTheme] = useState("dark");
  const [colors, setColor] = useState({ text: "white" });

  useEffect(() => {
    const updateTheme = () => {
      setTheme(document.body.classList.contains("light") ? "light" : "dark");
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = getComputedStyle(document.body);
    setColor({ text: root.getPropertyValue("--text").trim() });
  }, [theme]);

  return colors;
};

/* ---------- Component ---------- */
const Gauge = ({
  width = 300,
  height = 280,
  value = 0,
  color = "#334155",
  min = 0,
  max = 100,
  title = "",
  unit = "",
  ticks = 5, // số khoảng chia (tuỳ chọn)
}) => {
  const colors = useThemeColors();

  const range = max - min || 1;
  const clamped = Math.min(Math.max(value, min), max);
  const frac = (clamped - min) / range;
  const fillSweep = frac * SWEEP;
  const needleAngle = START_ANGLE + fillSweep;
  const activeColor = colorAt(frac); // màu của dải tại vị trí kim

  // Các đoạn màu từ min đến value, mỗi đoạn lấy màu theo vị trí tuyệt đối
  const step = SWEEP / SEGMENTS;
  const count = Math.ceil(fillSweep / step);
  const segments = [];
  for (let i = 0; i < count; i++) {
    const a0 = i * step;
    const a1 = Math.min((i + 1) * step + 0.6, fillSweep); // chồng nhẹ để không hở
    segments.push(
      <path
        key={i}
        d={arcPath(RADIUS, START_ANGLE + a0, START_ANGLE + a1)}
        stroke={colorAt((a0 + a1) / 2 / SWEEP)}
        strokeWidth={STROKE}
        fill="none"
      />
    );
  }

  // Vạch chia tại mỗi số + giá trị ngay dưới dải màu
  const inner = RADIUS - STROKE / 2;
  const tickItems = [];
  for (let i = 0; i <= ticks; i++) {
    const a = START_ANGLE + (i / ticks) * SWEEP;
    const [x0, y0] = polar(inner - 1.5, a);
    const [x1, y1] = polar(inner - 6.5, a);
    const [lx, ly] = polar(inner - 14, a);
    tickItems.push(
      <g key={i}>
        <line
          x1={x0}
          y1={y0}
          x2={x1}
          y2={y1}
          stroke={colors.text}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <text
          x={lx}
          y={ly}
          fill={colors.text}
          fillOpacity="0.85"
          fontSize={TICK_FONT}
          fontWeight="500"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {fmt(min + (i / ticks) * range)}
        </text>
      </g>
    );
  }

  const [sx, sy] = polar(RADIUS, START_ANGLE);
  const [ex, ey] = polar(RADIUS, needleAngle);
  const cap = STROKE / 2;

  return (
    <div
      className="gauge"
      style={{
        width,
        height,
        "--gauge-color": color,
        "--gauge-size": `${Math.min(width, height)}px`,
      }}
      role="meter"
      aria-label={title}
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
    >
      <svg className="gauge__svg" viewBox="0 0 200 172" preserveAspectRatio="xMidYMid meet">
        {/* Dải màu xanh - vàng - đỏ (chỉ tô đến value) */}
        <g>
          <circle cx={sx} cy={sy} r={cap} fill={colorAt(0)} />
          {segments}
          {fillSweep > 0 && <circle cx={ex} cy={ey} r={cap} fill={colorAt(frac)} />}
        </g>

        {/* Đường bao toàn dải: phần chưa tới để trong suốt */}
        <path
          d={bandOutline(START_ANGLE, START_ANGLE + SWEEP)}
          fill="none"
          stroke={colors.text}
          strokeOpacity="0.7"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {tickItems}

        {/* Kim hình tam giác */}
        <g
          className="gauge__needle"
          style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: `${CX}px ${CY}px` }}
        >
          <polygon
            points={`${CX - 4.5},${CY} ${CX + 4.5},${CY} ${CX},${CY - 44}`}
            fill={colors.text}
          />
        </g>
        <circle cx={CX} cy={CY} r="8.5" fill={colors.text} />

        {/* Giá trị + đơn vị dưới kim, căn giữa theo trục kim */}
        <text
          x={CX}
          y={CY + 34}
          fill={activeColor}
          fontSize={VALUE_FONT}
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {fmt(value)}
          {unit && (
            <tspan fill={colors.text} dx="3" fontSize={UNIT_FONT} fontWeight="500">
              {unit}
            </tspan>
          )}
        </text>
      </svg>

      <div className="gauge__title">{title}</div>
    </div>
  );
};

/* ---------- SimGauge: nửa đường tròn, 1 màu, không vạch ---------- */
const SIM_START = -90; // nửa đường tròn: từ trái (-90°) sang phải (+90°)
const SIM_SWEEP = 180;
const SIM_VALUE_FONT = 28;
const SIM_UNIT_FONT = 12;
const SIM_LABEL_FONT = 9;
const SIM_TITLE_FONT = 10;

const SimGauge = ({
  width = 240,
  height = 160,
  value = 0,
  color = "#22c55e",
  min, // không truyền thì ẩn nhãn đầu, tính toán dùng mặc định 0
  max, // không truyền thì ẩn nhãn cuối, tính toán dùng mặc định 100
  title = "",
  unit = "",
}) => {
  const hasMin = min !== undefined && min !== null;
  const hasMax = max !== undefined && max !== null;
  const lo = hasMin ? min : 0;
  const hi = hasMax ? max : 100;

  const range = hi - lo || 1;
  const clamped = Math.min(Math.max(value, lo), hi);
  const frac = (clamped - lo) / range;
  const endAngle = SIM_START + frac * SIM_SWEEP;

  const colors = useThemeColors();
  const [sx, sy] = polar(RADIUS, SIM_START);

  return (
    <div
      className="simgauge"
      style={{
        width,
        height,
        "--gauge-color": color,
        "--gauge-size": `${Math.min(width, height)}px`,
      }}
      role="meter"
      aria-label={title}
      aria-valuenow={clamped}
      aria-valuemin={lo}
      aria-valuemax={hi}
    >
      <svg className="simgauge__svg" viewBox="0 0 200 122" preserveAspectRatio="xMidYMid meet">
        {/* Nền dải (phần chưa tới) */}
        <path
          d={arcPath(RADIUS, SIM_START, SIM_START + SIM_SWEEP)}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          stroke={colors.text}
          strokeOpacity="0.18"
        />

        {/* Dải màu đến value */}
        {frac > 0 ? (
          <path
            d={arcPath(RADIUS, SIM_START, endAngle)}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        ) : (
          <circle cx={sx} cy={sy} r={STROKE / 2} fill={color} />
        )}

        {/* Min / Max ở hai đầu, chỉ hiện khi có truyền vào */}
        {hasMin && (
          <text
            x={CX - RADIUS}
            y={CY + 18}
            fontSize={SIM_LABEL_FONT}
            fontWeight="500"
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            fillOpacity="0.8"
          >
            {fmt(min)}
          </text>
        )}
        {hasMax && (
          <text
            x={CX + RADIUS}
            y={CY + 18}
            fontSize={SIM_LABEL_FONT}
            fontWeight="500"
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            fillOpacity="0.8"
          >
            {fmt(max)}
          </text>
        )}

        {/* Giá trị (màu color) + đơn vị (colors.text) ở giữa */}
        <text
          x={CX}
          y={CY - 16}
          fill={color}
          fontSize={SIM_VALUE_FONT}
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {fmt(value)}
          {unit && (
            <tspan dx="3" fontSize={SIM_UNIT_FONT} fontWeight="500" fill={colors.text}>
              {unit}
            </tspan>
          )}
        </text>

        {/* Title ngay dưới số */}
        {title && (
          <text
            x={CX}
            y={CY + 6}
            fill={colors.text}
            fontSize={SIM_TITLE_FONT}
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {title}
          </text>
        )}
      </svg>
    </div>
  );
};

export { Gauge, SimGauge };
export default Gauge;