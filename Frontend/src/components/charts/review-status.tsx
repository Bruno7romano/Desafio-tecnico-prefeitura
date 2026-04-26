'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  revisadas: number;
  total: number;
};

export function ReviewStatusChart({ revisadas, total }: Props) {
  const data = [
    { name: 'Revisadas', value: revisadas, color: '#10b981' },
    { name: 'Pendentes', value: total - revisadas, color: '#f59e0b' },
  ];

  const percentual = total > 0 ? Math.round((revisadas / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status de revisão</CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {percentual}% dos casos já foram revisados pela equipe
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
              fontSize={12}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(30 41 59)',
                border: 'none',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
