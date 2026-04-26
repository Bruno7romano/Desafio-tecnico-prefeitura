'use client';

import { useEffect, useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { ALERT_LABELS, BAIRROS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

type AreaData = { alertas: string[] } | null;

type Child = {
  id: string;
  nome: string;
  data_nascimento: string;
  bairro: string;
  revisado: boolean;
  saude: AreaData;
  educacao: AreaData;
  assistencia_social: AreaData;
};

type ApiResponse = {
  data: Child[];
  pagination: { total: number; page: number; limit: number; pages: number };
};

function getAllAlertas(child: Child): string[] {
  return [
    ...(child.saude?.alertas ?? []),
    ...(child.educacao?.alertas ?? []),
    ...(child.assistencia_social?.alertas ?? []),
  ];
}

function calcularIdade(dataNascimento: string): string {
  const anos = Math.floor(
    (Date.now() - new Date(dataNascimento).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
  return `${anos} ano${anos !== 1 ? 's' : ''}`;
}

function ChildrenContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [bairro, setBairro] = useState(searchParams.get('bairro') ?? 'todos');
  const [comAlertas, setComAlertas] = useState(searchParams.get('com_alertas') ?? 'todos');
  const [revisado, setRevisado] = useState(searchParams.get('revisado') ?? 'todos');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));

  // Sincroniza estado com URL (para refresh preservar filtros)
  useEffect(() => {
    const params = new URLSearchParams();
    if (bairro !== 'todos') params.set('bairro', bairro);
    if (comAlertas === 'true') params.set('com_alertas', 'true');
    if (revisado !== 'todos') params.set('revisado', revisado);
    if (page > 1) params.set('page', String(page));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [bairro, comAlertas, revisado, page, pathname, router]);

  const apiParams = new URLSearchParams();
  if (bairro !== 'todos') apiParams.set('bairro', bairro);
  if (comAlertas === 'true') apiParams.set('com_alertas', 'true');
  if (revisado !== 'todos') apiParams.set('revisado', revisado);
  apiParams.set('page', String(page));
  apiParams.set('limit', '10');

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ['children', bairro, comAlertas, revisado, page],
    queryFn: async () => (await api.get(`/children?${apiParams}`)).data,
  });

  function resetPage() {
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center gap-3">
          <Link href="/dashboard" aria-label="Voltar ao dashboard">
            <Button variant="ghost" size="icon" aria-label="Voltar ao dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Crianças Acompanhadas</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {data ? `${data.pagination.total} resultado${data.pagination.total !== 1 ? 's' : ''}` : '...'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3" role="search" aria-label="Filtros de busca">
          <Select value={bairro} onValueChange={(v) => { setBairro(v); resetPage(); }}>
            <SelectTrigger className="w-48 bg-white dark:bg-slate-800" aria-label="Filtrar por bairro">
              <SelectValue placeholder="Bairro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os bairros</SelectItem>
              {BAIRROS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={comAlertas} onValueChange={(v) => { setComAlertas(v); resetPage(); }}>
            <SelectTrigger className="w-44 bg-white dark:bg-slate-800" aria-label="Filtrar por alertas">
              <SelectValue placeholder="Alertas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="true">Com alertas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={revisado} onValueChange={(v) => { setRevisado(v); resetPage(); }}>
            <SelectTrigger className="w-44 bg-white dark:bg-slate-800" aria-label="Filtrar por status de revisão">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="false">Pendentes</SelectItem>
              <SelectItem value="true">Revisados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista */}
        <ul className="space-y-3" aria-label="Lista de crianças">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <li key={i}><Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card></li>
              ))
            : data?.data.map((child) => {
                const alertas = getAllAlertas(child);
                return (
                  <li key={child.id}>
                    <Link href={`/children/${child.id}`} aria-label={`Ver detalhes de ${child.nome}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{child.nome}</p>
                                {child.revisado
                                  ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" aria-label="Caso revisado" />
                                  : alertas.length > 0 && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" aria-label="Possui alertas" />
                                }
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {calcularIdade(child.data_nascimento)} · {child.bairro}
                              </p>
                              {alertas.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {alertas.map(a => (
                                    <Badge key={a} variant="destructive" className="text-xs">
                                      {ALERT_LABELS[a] ?? a}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Badge variant={child.revisado ? 'secondary' : 'outline'} className="shrink-0">
                              {child.revisado ? 'Revisado' : 'Pendente'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })
          }
        </ul>

        {/* Paginação */}
        {data && data.pagination.pages > 1 && (
          <nav className="flex items-center justify-center gap-3" aria-label="Paginação">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
              Página {page} de {data.pagination.pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        )}

      </div>
    </main>
  );
}

export default function ChildrenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><p className="text-slate-500 dark:text-slate-400">Carregando...</p></div>}>
      <ChildrenContent />
    </Suspense>
  );
}
