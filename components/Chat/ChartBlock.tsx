import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartSpec } from '../../types';

interface ChartBlockProps {
  spec: ChartSpec;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ChartBlock: React.FC<ChartBlockProps> = ({ spec }) => {
  const chartData = useMemo(() => {
    // Transform spec: x: ['A', 'B'], series: [{name: 'S1', data: [1, 2]}]
    // To Recharts: [{ name: 'A', S1: 1 }, { name: 'B', S1: 2 }]
    return spec.x.map((xLabel, index) => {
      const dataPoint: Record<string, any> = { name: xLabel };
      spec.series.forEach((s) => {
        dataPoint[s.name] = s.data[index];
      });
      return dataPoint;
    });
  }, [spec]);

  const renderChart = () => {
    if (spec.type === 'bar') {
      return (
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          {spec.series.map((s, idx) => (
            <Bar
              key={s.name}
              dataKey={s.name}
              fill={COLORS[idx % COLORS.length]}
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          ))}
        </BarChart>
      );
    } else {
      return (
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip 
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          {spec.series.map((s, idx) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={3}
              dot={{ r: 4, fill: COLORS[idx % COLORS.length], strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      );
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg border border-gray-100 shadow-sm my-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center uppercase tracking-wide">
        {spec.title}
      </h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};