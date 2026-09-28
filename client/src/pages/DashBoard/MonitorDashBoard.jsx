import React, { useEffect, useMemo, useState } from "react";
import "./MonitorDashBoard.css";

/* ================= Cấu hình ================= */
const SERIES = [
  { key: "pv", label: "Công suất PV (Solar)", short: "PV", color: "#F59E0B" },
  { key: "grid", label: "Công suất Lưới", short: "Lưới", color: "#2FA8F5" },
  { key: "load", label: "Công suất Tải Tự Dùng", short: "Tải", color: "#22C58B" },
];
const RANGES = [
  { key: "day", label: "Ngày (24 Giờ)", n: 24, unit: "kW", x: (i) => `${String(i).padStart(2, "0")}:00` },
  { key: "month", label: "Tháng (30 Ngày)", n: 30, unit: "MWh", x: (i) => `${i + 1}` },
  { key: "year", label: "Năm (12 Tháng)", n: 12, unit: "MWh", x: (i) => `T${i + 1}` },
];

/* ================= Dữ liệu mô phỏng (thay bằng API thật) ================= */
const rnd = (s) => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
const r1 = (v) => Math.round(v * 10) / 10;

function buildData(range) {
  const { n } = RANGES.find((r) => r.key === range);
  return Array.from({ length: n }, (_, i) => {
    let pv, load;
    if (range === "day") {
      pv = 500 * Math.max(0, Math.sin(((i - 6) / 12) * Math.PI)) * (0.92 + rnd(i) * 0.1);
      load = 220 + 320 * Math.sin(((i - 5) / 24) * Math.PI * 2) ** 2 + rnd(i + 50) * 40;
    } else if (range === "month") {
      pv = 2 + rnd(i + 7) * 1.6; load = 4.2 + rnd(i + 90) * 0.8;
    } else {
      pv = 40 + 30 * Math.sin(((i - 2) / 12) * Math.PI) + rnd(i + 3) * 6; load = 120 + rnd(i + 200) * 14;
    }
    return { pv: r1(pv), grid: r1(Math.max(0, load - pv)), load: r1(load) };
  });
}

/* ================= Biểu đồ đường ================= */
function LineChart({ data, active, range }) {
  const [hv, setHv] = useState(null);
  const W = 860, H = 300, P = { l: 48, r: 14, t: 12, b: 28 };
  const cfg = RANGES.find((r) => r.key === range);
  const n = data.length;
  const max = Math.max(1, ...data.flatMap((d) => active.map((k) => d[k])));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const x = (i) => P.l + (i * (W - P.l - P.r)) / (n - 1);
  const y = (v) => H - P.b - (v / top) * (H - P.t - P.b);
  const every = n > 24 ? 3 : n > 12 ? 2 : 1;
  const shown = SERIES.filter((s) => active.includes(s.key));
  const onMove = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - b.left) / b.width) * W;
    setHv(Math.min(n - 1, Math.max(0, Math.round(((px - P.l) / (W - P.l - P.r)) * (n - 1)))));
  };
  return (
    <div className="md-chart">
      <div className="md-legend-top">
        {shown.map((s) => <span key={s.key}><i style={{ background: s.color }} />{s.label} ({cfg.unit})</span>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={() => setHv(null)}>
        <defs>
          {SERIES.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={s.color} stopOpacity=".28" /><stop offset="1" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t * top)} y2={y(t * top)} className="md-gl" />
            <text x={P.l - 8} y={y(t * top) + 4} textAnchor="end" className="md-ax">{Math.round(t * top)}</text>
          </g>
        ))}
        {data.map((_, i) => i % every === 0 && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="md-ax">{cfg.x(i)}</text>
        ))}
        {shown.map((s) => {
          const pts = data.map((d, i) => `${x(i)},${y(d[s.key])}`).join(" ");
          return (
            <g key={s.key}>
              <polygon points={`${x(0)},${y(0)} ${pts} ${x(n - 1)},${y(0)}`} fill={`url(#g-${s.key})`} />
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" />
            </g>
          );
        })}
        {hv !== null && (
          <g>
            <line x1={x(hv)} x2={x(hv)} y1={P.t} y2={H - P.b} className="md-cur" />
            {shown.map((s) => <circle key={s.key} cx={x(hv)} cy={y(data[hv][s.key])} r="5" fill="#0B1220" stroke={s.color} strokeWidth="2.5" />)}
          </g>
        )}
      </svg>
      {hv !== null && (
        <div className="md-tip" style={{ left: `${Math.min(85, Math.max(10, (x(hv) / W) * 100))}%` }}>
          <b>{cfg.x(hv)}</b>
          {shown.map((s) => <div key={s.key}><i style={{ background: s.color }} />{s.short}: {data[hv][s.key]} {cfg.unit}</div>)}
        </div>
      )}
      {!shown.length && <p className="md-empty">Chọn ít nhất một đường để xem biểu đồ.</p>}
      <div className="md-foot"><em>* Dữ liệu xếp từ trái sang phải: {cfg.x(0)} → {cfg.x(n - 1)}</em><span>Đơn vị: {cfg.unit}</span></div>
    </div>
  );
}

/* ================= Biểu đồ tròn ================= */
function Donut({ pv, grid }) {
  const total = pv + grid || 1, R = 74, C = 2 * Math.PI * R, len = (pv / total) * C;
  return (
    <svg viewBox="0 0 200 200" className="md-donut" role="img" aria-label="Tỷ lệ PV và lưới">
      <g transform="rotate(-90 100 100)" fill="none" strokeWidth="22">
        <circle cx="100" cy="100" r={R} stroke={SERIES[1].color} />
        <circle cx="100" cy="100" r={R} stroke={SERIES[0].color} strokeDasharray={`${len} ${C - len}`} style={{ transition: "stroke-dasharray .6s" }} />
      </g>
      <text x="100" y="104" textAnchor="middle" className="md-dn-big">{Math.round(total)}</text>
      <text x="100" y="124" textAnchor="middle" className="md-dn-sub">kW TỔNG TẢI</text>
    </svg>
  );
}

/* ================= Thành phần chính ================= */
const TODAY = { pv: 2480, grid: 1810, load: 4290 }; // kWh hôm nay (thay bằng API)
const LOGS = [
  { t: "ok", title: "Inverter Đạt Đỉnh Công Suất", msg: "Sản lượng mặt trời đạt đỉnh 382kW, vận hành tối ưu.", ago: "15 phút trước" },
  { t: "warn", title: "Cảnh Báo Hệ Số Cos φ", msg: "Tụ bù tự động đã kích hoạt, duy trì Cos φ > 0.95.", ago: "45 phút trước" },
  { t: "info", title: "Kiểm Tra Điện Áp Lưới", msg: "Điện áp 3 pha 22kV ổn định ở ngưỡng 22.1kV.", ago: "2 giờ trước" },
];

export default function MonitorDashBoard() {
  const [live, setLive] = useState({ pv: 380, load: 530.9 });
  const [running, setRunning] = useState(true);
  const [range, setRange] = useState("day");
  const [active, setActive] = useState(["pv", "grid", "load"]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLive((p) => ({
        pv: Math.max(0, Math.min(500, p.pv + (Math.random() - 0.5) * 20)),
        load: Math.max(200, Math.min(700, p.load + (Math.random() - 0.5) * 16)),
      }));
      setNow(new Date());
    }, 2000);
    return () => clearInterval(t);
  }, [running]);

  const grid = Math.max(0, live.load - live.pv);
  const selfPct = Math.round((Math.min(live.pv, live.load) / live.load) * 100);
  const data = useMemo(() => buildData(range), [range]);
  const dayData = useMemo(() => buildData("day"), []);
  const toggle = (k) => setActive((a) => (a.includes(k) ? a.filter((v) => v !== k) : [...a, k]));
  const fmt = (v) => v.toLocaleString("vi-VN");

  const kpis = [
    { ic: "☀", c: "#F59E0B", l: "Tỷ lệ tự dùng PV (Self-Consumption)", v: `${selfPct}%` },
    { ic: "❦", c: "#22C58B", l: "Giảm phát thải CO₂ (Hôm nay)", v: `${(TODAY.pv * 0.72 / 1000).toFixed(2)} Tấn CO₂` },
    { ic: "₫", c: "#2FA8F5", l: "Ước tính tiết kiệm điện", v: `${(TODAY.pv * 1978 / 1e6).toFixed(2)} Triệu VNĐ` },
    { ic: "◔", c: "#A78BFA", l: "Chất lượng lưới (Tần số / Cos φ)", v: "50.01 Hz | Cos φ: 0.98", mono: true },
  ];
  const cards = [
    { k: "pv", ic: "☀", name: "Công Suất PV (Solar)", sub: "Hệ thống NLMT mái nhà", v: live.pv, badge: "+3.2%", l2: "Sản lượng hôm nay", v2: TODAY.pv,
      foot: <><div className="md-row"><span>Hiệu suất phát hiện tại</span><span>{Math.round((live.pv / 500) * 100)}% Max (500kWp)</span></div>
        <div className="md-bar"><i style={{ width: `${(live.pv / 500) * 100}%` }} /></div></> },
    { k: "grid", ic: "⚡", name: "Công Suất Lưới Quốc Gia", sub: "Trạm biến áp trung thế", v: grid, badge: "−1.8%", l2: "Điện nhận hôm nay", v2: TODAY.grid,
      foot: <div className="md-row"><span>Chiều dòng điện:</span><span className="md-pill">{grid > 0 ? "↙ Đang mua điện lưới" : "↗ Phát ngược lưới"}</span></div> },
    { k: "load", ic: "∿", name: "Công Suất Tải Nhà Máy", sub: "Tổng tiêu thụ toàn xưởng", v: live.load, badge: "+1.5%", l2: "Tổng tiêu thụ hôm nay", v2: TODAY.load,
      foot: <div className="md-row"><span>Cân bằng công suất:</span><code>Tải = PV ({live.pv.toFixed(0)}) + Lưới ({grid.toFixed(0)})</code></div> },
  ];

  return (
    <div className={`md-root`}>

      <header className="md-header">
        <div className="md-brand">
          <div>
            <h1>Giám Sát Điện Năng Nhà Máy <span className="md-badge">Hệ Thống Trực Tuyến</span></h1>
          </div>
        </div>
        <div className="md-actions">
          <button className="md-btn live" onClick={() => setRunning((r) => !r)}>{running ? "▶ MÔ PHỎNG LIVE" : "❚❚ TẠM DỪNG"}</button>
          <span className="md-btn">◷ Cập nhật: {now.toLocaleTimeString("vi-VN")}</span>
          
        </div>
      </header>

      <main className="md-wrap">
        <section className="md-kpis">
          {kpis.map((k) => (
            <div key={k.l} className="md-kpi">
              <span className="md-ico" style={{ "--c": k.c }}>{k.ic}</span>
              <div><small>{k.l}</small><b className={k.mono ? "mono" : ""} style={{ color: k.c }}>{k.v}</b></div>
            </div>
          ))}
        </section>

        <section className="md-cards">
          {cards.map((c) => {
            const s = SERIES.find((x) => x.key === c.k);
            return (
              <article key={c.k} className="md-card" style={{ "--c": s.color }}>
                <div className="md-card-top">
                  <span className="md-ico" style={{ "--c": s.color }}>{c.ic}</span>
                  <div><h2>{c.name}</h2><small>{c.sub}</small></div>
                  <span className="md-trend">{c.badge}</span>
                </div>
                <div className="md-card-mid">
                  <div className="md-big">{c.v.toFixed(1)}<span>kW</span></div>
                  <div className="md-side"><small>{c.l2}</small><b>{fmt(c.v2)} kWh</b></div>
                </div>
                <div className="md-card-foot">{c.foot}</div>
              </article>
            );
          })}
        </section>

        <section className="md-main">
          <article className="md-panel">
            <div className="md-toolbar">
              <div><h2>∿ Biểu Đồ Theo Dõi Công Suất Theo Thời Gian</h2><small>Mô phỏng đường cong công suất PV, lưới điện và phụ tải</small></div>
              <div className="md-tabs" role="tablist">
                {RANGES.map((r) => (
                  <button key={r.key} role="tab" aria-selected={range === r.key} className={range === r.key ? "on" : ""} onClick={() => setRange(r.key)}>{r.label}</button>
                ))}
              </div>
            </div>
            <div className="md-checks">
              <span>Tích chọn hiển thị:</span>
              {SERIES.map((s) => (
                <label key={s.key} style={{ "--c": s.color }} className={active.includes(s.key) ? "on" : ""}>
                  <input type="checkbox" checked={active.includes(s.key)} onChange={() => toggle(s.key)} />
                  <span className="box" />{s.label}
                </label>
              ))}
            </div>
            <LineChart data={data} active={active} range={range} />
          </article>

          <article className="md-panel">
            <h2>▤ Tỷ Lệ Điện Nhà Máy Sử Dụng</h2>
            <small>Tỷ lệ công suất tiêu thụ từ Solar PV vs điện lưới</small>
            <Donut pv={Math.min(live.pv, live.load)} grid={grid} />
            <ul className="md-legend">
              <li><i style={{ background: SERIES[0].color }} />Từ PV Solar<b>{Math.min(live.pv, live.load).toFixed(0)} kW</b></li>
              <li><i style={{ background: SERIES[1].color }} />Từ Lưới Quốc Gia<b>{grid.toFixed(0)} kW</b></li>
            </ul>
            <div className="md-row md-sep"><span>Mức giảm tải điện lưới:</span><b className="ok">{selfPct}% tự cấp từ PV</b></div>
          </article>
        </section>

        <section className="md-main">
          <article className="md-panel">
            <div className="md-toolbar">
              <h2>◷ Lịch Sử Thông Số Điện Năng Gần Đây (24 Giờ)</h2>
              <button className="md-btn warn" onClick={() => window.print()}>⤓ Xuất Báo Cáo</button>
            </div>
            <div className="md-scroll">
              <table>
                <thead><tr><th>Thời gian</th><th style={{ color: SERIES[0].color }}>Công suất PV (kW)</th><th style={{ color: SERIES[1].color }}>Công suất lưới (kW)</th><th style={{ color: SERIES[2].color }}>Công suất tải (kW)</th><th className="r">Tỷ lệ solar (%)</th></tr></thead>
                <tbody>
                  {[...dayData.map((d, i) => ({ ...d, i }))].reverse().slice(0, 6).map((d) => (
                    <tr key={d.i}>
                      <td>{String(d.i).padStart(2, "0")}:00</td>
                      <td style={{ color: SERIES[0].color }}>{d.pv} kW</td>
                      <td style={{ color: SERIES[1].color }}>{d.grid} kW</td>
                      <td style={{ color: SERIES[2].color }}>{d.load} kW</td>
                      <td className="r"><span className="md-tag">{Math.round((Math.min(d.pv, d.load) / d.load) * 100)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="md-panel">
            <div className="md-toolbar"><h2>🔔 Nhật Ký Sự Cố &amp; Cảnh Báo</h2><span className="md-badge red">Trực tuyến</span></div>
            <div className="md-logs">
              {LOGS.map((l) => (
                <div key={l.title} className={`md-log ${l.t}`}><b>{l.title}</b><p>{l.msg}</p><small>{l.ago}</small></div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
