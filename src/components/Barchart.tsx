"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MostViewsByJenis {
  jenis: string;
  totalViews: number;
}

interface ChartKategoriProps {
  mostViewsByJenis: MostViewsByJenis[];
}

export default function ChartKategori({ mostViewsByJenis }: ChartKategoriProps) {
  // map supaya sesuai format recharts
  const data = mostViewsByJenis.map((item) => ({
    name: item.jenis,
    value: item.totalViews,
  }));

  return (
    <div style={{ background: "#fff", padding: "1rem", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "1.4rem",
            fontWeight: 400,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Jumlah per Kategori
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#c084fc" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
