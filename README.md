# Painel de Acompanhamento Social — Prefeitura do Rio

Painel para técnicos de campo da Prefeitura acompanharem crianças em situação de vulnerabilidade social, cruzando dados de saúde, educação e assistência social.

---

## Stack

- **Backend**: Node.js + Express + TypeScript + SQLite (better-sqlite3)
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Auth**: JWT (jsonwebtoken)
- **Validação**: Zod
- **Estado servidor**: TanStack Query
- **Gráficos**: Recharts
- **Infra**: Docker + Docker Compose

---

## Como rodar

### Com Docker (recomendado)

```bash
docker compose up --build
```

Pronto. Frontend em `http://localhost:3000`, backend em `http://localhost:3001`.

### Localmente (sem Docker)

**Backend:**
```bash
cd Backend
npm install
cp .env.example .env
npm run dev
```

**Frontend (em outro terminal):**
```bash
cd Frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm run dev
```

---

## Credenciais de teste

```
E-mail: tecnico@prefeitura.rio
Senha:  painel@2024
```

---

## Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/auth/token` | Autentica e retorna JWT (8h) | — |
| `GET`  | `/children` | Lista crianças com filtros e paginação | — |
| `GET`  | `/children/:id` | Detalhe completo de uma criança | — |
| `PATCH` | `/children/:id/review` | Marca caso como revisado | ✓ |
| `GET`  | `/summary` | Agregações para o dashboard | — |
| `GET`  | `/summary/by-bairro` | Agregação de alertas por bairro | — |

**Filtros do `/children`:** `bairro`, `com_alertas=true`, `revisado=true|false`, `page`, `limit`.

---

## Decisões arquiteturais

### Banco em uma única tabela com colunas JSON

Modelei `children` como uma única tabela onde as três áreas (saúde, educação, assistência social) são colunas de texto contendo JSON serializado.

**Por quê:** com 25 registros, a complexidade de modelar três tabelas relacionadas com JOINs trazia overhead sem retorno. Escrevi o filtro de "presença de alertas" em JavaScript após buscar tudo do banco — para esse volume é instantâneo e mantém o código simples.

**Se o volume crescesse para milhares ou milhões de crianças, eu mudaria:**
- Tabelas separadas (`children_saude`, `children_educacao`, `children_assistencia`)
- Coluna materializada `has_alerts` indexada para filtros rápidos
- Paginação real no SQL (não em JS) com `LIMIT/OFFSET`
- Migrar de SQLite para PostgreSQL para concorrência de escritas e índices GIN em JSON

A decisão consciente foi: **otimizar para legibilidade e prazo, não para escala hipotética.**

### Token em localStorage + cookie

O JWT é guardado em `localStorage` (acessível ao JS do frontend) e duplicado em um cookie (lido pelo proxy do Next.js que protege as rotas).

**Trade-off conhecido:** `localStorage` é vulnerável a XSS. Em produção real, eu colocaria o token em um cookie `httpOnly` e moveria a auth para um endpoint que o frontend pudesse chamar via session-based flow. Para o escopo do desafio, a abordagem atual é simples e funcional.

### Backend monolítico, sem ORM

Não usei Prisma/Drizzle — o esquema é uma tabela só, queries são triviais, ORM seria complexidade desnecessária.

### Validação com Zod

Usei Zod para validar:
- Body do `POST /auth/token` (formato de email, senha não-vazia)
- Query params do `GET /children` (page e limit numéricos com bounds)

Erros retornam `400` com detalhes do campo, distinguíveis de `401` (credenciais erradas) e `404` (não encontrado).

### Filtros sincronizados com a URL

Um `useEffect` espelha o estado dos filtros para a query string. Refresh preserva o que o usuário filtrou. Permite também links compartilháveis e navegação por histórico.

---

## Tratamento de casos-limite

O seed contém edge cases intencionais. O sistema os trata distintamente:

| Caso | Comportamento |
|------|---------------|
| Área = `null` (criança não consta no sistema) | Card mostra mensagem "Criança não consta no sistema de X" com ícone próprio |
| Área existe, campos internos `null` (ex: matrícula pendente) | Mostra "Não matriculada" / "Não informado" sem ocultar a área |
| Todas as três áreas `null` (c015 — Amanda Xavier) | Alerta destacado no topo da página + os três cards explicando a ausência |
| Múltiplos alertas em todas as áreas (c014, c025) | Todos os badges renderizados, nada ocultado |

A distinção entre "não consta no sistema" vs "consta mas dado incompleto" foi um cuidado consciente — comunica realidades operacionais diferentes para o técnico.

---

## Acessibilidade

- `aria-label` em todos os botões só com ícone
- `<ul>` / `<li>` na lista de crianças, `<nav>` na paginação
- `aria-live="polite"` no contador de paginação
- `role="search"` na seção de filtros
- Inputs do login com `<Label>` associado e `autoComplete`
- Contraste validado em light e dark mode (WCAG AA nos textos principais)
- Navegação por teclado funcional (foco visível via shadcn/ui)

---

## Responsividade

Testado de 375px (iPhone SE) a 1440px+. Os filtros empilham no mobile, os cards do detalhe viram coluna única, a paginação se mantém centralizada.

---

## Diferenciais entregues

- ✅ **shadcn/ui** como biblioteca de componentes
- ✅ **Dark mode** (com toggle e detecção de preferência do sistema via `next-themes`)
- ✅ **Visualizações com Recharts** (barras de alertas por bairro, donut de status de revisão)
- ✅ **Acessibilidade WCAG AA** nos pontos principais
- ✅ **Validação no backend com Zod**

---

## O que faria diferente com mais tempo

1. **Testes** — o maior débito técnico. Vitest + Supertest no backend para validar o comportamento dos filtros e edge cases; Testing Library para o detalhe (lidando com `null` em todas as áreas); Playwright para o fluxo de login → dashboard → revisar.

2. **Deploy público** — Vercel + Railway. Não fiz por questão de tempo, mas estaria entregue com URL clicável.

3. **Persistência mais robusta** — migrar de SQLite para PostgreSQL e usar tabelas relacionais (descrito acima), com migrations versionadas via `node-pg-migrate` ou similar.

4. **Histórico de revisões** — hoje cada criança tem um único registro de "revisado" que é sobrescrito. O ideal seria uma tabela de auditoria `revisoes(child_id, technician, created_at, observacoes)`.

5. **HttpOnly cookies** — mover o JWT para fora do `localStorage`.

6. **State management dos filtros** — hoje a URL é atualizada via `replace`, mas poderia integrar `nuqs` para um state-management mais elegante e tipado.

7. **Mapa de calor por bairro** — tinha vontade de plotar a geografia do Rio com intensidade de alertas por região, mas o ROI no tempo restante não compensava o gráfico de barras que entreguei.

8. **Error boundary** no frontend para falhas inesperadas.

---

## Estrutura de pastas

```
prefeitura-painel/
├── Backend/
│   ├── src/
│   │   ├── db/              # database.ts, seed.ts
│   │   ├── middleware/      # auth.ts (verificação JWT)
│   │   ├── routes/          # auth, children, summary
│   │   └── index.ts
│   ├── data/seed.json
│   ├── Dockerfile
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── app/             # App Router: login, dashboard, children/[id]
│   │   ├── components/      # ui/ (shadcn), charts/
│   │   ├── lib/             # api.ts, auth.ts, constants.ts
│   │   └── proxy.ts         # proteção de rotas
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## Observação final

Este projeto foi muito prazeroso. Trabalho em uma empresa de saúde, e ao longo do desenvolvimento surgiram vários insights sobre como aplicar soluções semelhantes para melhorar a qualidade das informações internas — o que tornou a experiência ainda mais significativa.

O maior desafio técnico foi estudar e aplicar JWT na prática pela primeira vez. A curva de aprendizado foi mais suave do que eu esperava — em pouco tempo já me sentia confortável com o fluxo de autenticação, e isso me deu confiança de que tinha entendido o conceito de verdade, não só o código.

Por outro lado, aprendi da forma mais clássica possível: passei cerca de 40 minutos depurando um erro até descobrir que o Next.js 16 mudou a convenção de `middleware` para `proxy`. Lição registrada — sempre conferir a versão antes de assumir que a documentação que conheço ainda vale.

Encerro com a sensação de que este projeto entregou muito além do código: entregou aprendizado real. Agradeço pela oportunidade e pela jornada.
