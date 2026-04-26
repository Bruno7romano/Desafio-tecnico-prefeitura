'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, HeartPulse, GraduationCap, HandHeart, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AlertsByBairroChart } from '@/components/charts/alerts-by-bairro';
import { ReviewStatusChart } from '@/components/charts/review-status';

type Summary = {
  total: number;
  revisadas: number;
  alertas_por_area: {
    saude: number;
    educacao: number;
    assistencia_social: number;
  };
};

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  href,
  alert,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
  href?: string;
  alert?: boolean;
}) {
  const content = (
    <Card className={`transition-shadow hover:shadow-md ${alert && value > 0 ? 'border-red-200' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${alert && value > 0 ? 'text-red-500' : 'text-slate-400'}`} />
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${alert && value > 0 ? 'text-red-600' : 'text-slate-800 dark:text-slate-100'}`}>
          {value}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery<Summary>({
    queryKey: ['summary'],
    queryFn: async () => (await api.get('/summary')).data,
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
         Painel de Acompanhamento
         </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Prefeitura do Rio — Assistência Social</p>
        </div>
        <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/children" className="text-sm text-blue-600 hover:underline">
          Ver todas as crianças →
         </Link>
        </div>
      </div>

        {isError && (
          <Alert variant="destructive">
            <AlertDescription>Erro ao carregar os dados. Tente novamente.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : data ? (
            <>
              <StatCard
                title="Total de Crianças"
                value={data.total}
                icon={Users}
                description="acompanhadas no sistema"
                href="/children"
              />
              <StatCard
                title="Casos Revisados"
                value={data.revisadas}
                icon={CheckCircle}
                description={`de ${data.total} no total`}
                href="/children?revisado=true"
              />
              <StatCard
                title="Alertas de Saúde"
                value={data.alertas_por_area.saude}
                icon={HeartPulse}
                description="crianças com alertas"
                href="/children?com_alertas=true"
                alert
              />
              <StatCard
                title="Alertas de Educação"
                value={data.alertas_por_area.educacao}
                icon={GraduationCap}
                description="crianças com alertas"
                href="/children?com_alertas=true"
                alert
              />
            </>
          ) : null}
        </div>

        {data && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-slate-400" />
                Assistência Social
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${data.alertas_por_area.assistencia_social > 0 ? 'text-red-600' : 'text-slate-800 dark:text-slate-100'}`}>
                {data.alertas_por_area.assistencia_social}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">crianças com alertas de assistência</p>
            </CardContent>
          </Card>
        )}

        {data && (
          <div className="grid gap-4 lg:grid-cols-2">
            <AlertsByBairroChart />
            <ReviewStatusChart revisadas={data.revisadas} total={data.total} />
          </div>
        )}

      </div>
    </main>
  );
}