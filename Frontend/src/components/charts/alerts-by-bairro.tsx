'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';

type BairroData = {
  bairro: string;
  total: number;
  saude: number;
  educacao: number;
  assistencia_social: number;
};

export function AlertsByBairroChart() {
  const { data, isLoading } = useQuery<BairroData[]>({
    queryKey: ['summary-by-bairro'],
    queryFn: async () => (await api.get('/summary/by-bairro')).data,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alertas por bairro</CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribuição de crianças com alertas em cada área, agrupadas por bairro
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis
                dataKey="bairro"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(30 41 59)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                }}
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="saude" name="Saúde" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="educacao" name="Educação" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="assistencia_social" name="Assistência" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
