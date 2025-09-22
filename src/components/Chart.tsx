"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartPengunjungProps {
  viewsPerPeriode: { [key: string]: number };
}

export default function ChartPengunjung({ viewsPerPeriode }: ChartPengunjungProps) {
  // ubah object ke array untuk recharts
  const data = Object.entries(viewsPerPeriode).map(([month, value]) => ({
    name: month, // contoh: "2025-02"
    value,
  }));

  return (
    <div style={{ width: "100%", background: "#fff", borderRadius: 12, padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "1.4rem",
            fontWeight: 400,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Pengunjung
        </h3>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7B3FE4"
              strokeWidth={2}
              dot={{ r: 4, fill: "#7B3FE4" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
