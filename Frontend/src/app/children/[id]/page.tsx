'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, HeartPulse, GraduationCap, HandHeart,
  CheckCircle, AlertCircle, Clock, Ban
} from 'lucide-react';
import api from '@/lib/api';
import { ALERT_LABELS } from '@/lib/constants';

type Saude = { ultima_consulta: string | null; vacinas_em_dia: boolean; alertas: string[] } | null;
type Educacao = { escola: string | null; frequencia_percent: number | null; alertas: string[] } | null;
type Assistencia = { cad_unico: boolean; beneficio_ativo: boolean; alertas: string[] } | null;

type Child = {
  id: string;
  nome: string;
  data_nascimento: string;
  bairro: string;
  responsavel: string;
  revisado: boolean;
  revisado_por: string | null;
  revisado_em: string | null;
  saude: Saude;
  educacao: Educacao;
  assistencia_social: Assistencia;
};

function calcularIdade(dataNascimento: string): string {
  const anos = Math.floor(
    (Date.now() - new Date(dataNascimento).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
  return `${anos} ano${anos !== 1 ? 's' : ''}`;
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

function AlertaBadge({ alerta }: { alerta: string }) {
  return (
    <Badge variant="destructive" className="text-xs gap-1">
      <AlertCircle className="h-3 w-3" />
      {ALERT_LABELS[alerta] ?? alerta}
    </Badge>
  );
}

function AreaIndisponivel({ area }: { area: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-2">
      <Ban className="h-4 w-4" />
      <span className="text-sm">Criança não consta no sistema de {area}</span>
    </div>
  );
}

function SaudeCard({ saude }: { saude: Saude }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-rose-500" />
          Saúde
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {saude === null ? (
          <AreaIndisponivel area="saúde" />
        ) : (
          <>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Última consulta</span>
                <span className="font-medium dark:text-slate-100">
                  {saude.ultima_consulta ? formatarData(saude.ultima_consulta) : 'Não informado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Vacinas</span>
                <span className={`font-medium flex items-center gap-1 ${saude.vacinas_em_dia ? 'text-green-600' : 'text-red-600'}`}>
                  {saude.vacinas_em_dia
                    ? <><CheckCircle className="h-4 w-4" /> Em dia</>
                    : <><AlertCircle className="h-4 w-4" /> Atrasadas</>
                  }
                </span>
              </div>
            </div>
            {saude.alertas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {saude.alertas.map(a => <AlertaBadge key={a} alerta={a} />)}
              </div>
            )}
            {saude.alertas.length === 0 && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Sem alertas
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EducacaoCard({ educacao }: { educacao: Educacao }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-500" />
          Educação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {educacao === null ? (
          <AreaIndisponivel area="educação" />
        ) : (
          <>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Escola</span>
                <span className="font-medium text-right dark:text-slate-100">
                  {educacao.escola ?? 'Não matriculada'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Frequência</span>
                <span className={`font-medium ${
                  educacao.frequencia_percent === null ? 'text-slate-400'
                  : educacao.frequencia_percent < 75 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {educacao.frequencia_percent !== null ? `${educacao.frequencia_percent}%` : 'Não informado'}
                </span>
              </div>
            </div>
            {educacao.alertas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {educacao.alertas.map(a => <AlertaBadge key={a} alerta={a} />)}
              </div>
            )}
            {educacao.alertas.length === 0 && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Sem alertas
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AssistenciaCard({ assistencia }: { assistencia: Assistencia }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <HandHeart className="h-5 w-5 text-purple-500" />
          Assistência Social
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assistencia === null ? (
          <AreaIndisponivel area="assistência social" />
        ) : (
          <>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">CadÚnico</span>
                <span className={`font-medium ${assistencia.cad_unico ? 'text-green-600' : 'text-red-600'}`}>
                  {assistencia.cad_unico ? 'Cadastrado' : 'Não cadastrado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Benefício</span>
                <span className={`font-medium ${assistencia.beneficio_ativo ? 'text-green-600' : 'text-red-600'}`}>
                  {assistencia.beneficio_ativo ? 'Ativo' : 'Suspenso/Inativo'}
                </span>
              </div>
            </div>
            {assistencia.alertas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {assistencia.alertas.map(a => <AlertaBadge key={a} alerta={a} />)}
              </div>
            )}
            {assistencia.alertas.length === 0 && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Sem alertas
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [revisadoOk, setRevisadoOk] = useState(false);

  const { data: child, isLoading } = useQuery<Child>({
    queryKey: ['child', id],
    queryFn: async () => (await api.get(`/children/${id}`)).data,
  });

  const { mutate: marcarRevisado, isPending } = useMutation({
    mutationFn: () => api.patch(`/children/${id}/review`),
    onSuccess: () => {
      setRevisadoOk(true);
      queryClient.invalidateQueries({ queryKey: ['child', id] });
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </main>
    );
  }

  if (!child) return null;

  const todasAreasVazias = !child.saude && !child.educacao && !child.assistencia_social;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center gap-3">
          <Link href="/children" aria-label="Voltar para lista de crianças">
            <Button variant="ghost" size="icon" aria-label="Voltar para lista de crianças">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{child.nome}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {calcularIdade(child.data_nascimento)} · {child.bairro} · Responsável: {child.responsavel}
            </p>
          </div>
        </div>

        {todasAreasVazias && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta criança não possui dados em nenhum dos sistemas integrados. Pode indicar cadastro recente ou necessidade de verificação manual.
            </AlertDescription>
          </Alert>
        )}

        {revisadoOk && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Caso marcado como revisado com sucesso.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
          <SaudeCard saude={child.saude} />
          <EducacaoCard educacao={child.educacao} />
          <AssistenciaCard assistencia={child.assistencia_social} />
        </div>

        <Card>
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              {child.revisado ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-sm">Caso revisado</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      por {child.revisado_por} em {child.revisado_em ? formatarData(child.revisado_em) : '—'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="h-5 w-5" />
                  <p className="text-sm">Revisão pendente</p>
                </div>
              )}
            </div>

            {!child.revisado && (
              <Button onClick={() => marcarRevisado()} disabled={isPending}>
                {isPending ? 'Salvando...' : 'Marcar como revisado'}
              </Button>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}