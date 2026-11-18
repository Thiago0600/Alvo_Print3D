# Alvo Print 3D — Website e plataforma de encomendas

Website profissional de impressão 3D com criação de modelos 3D a partir de fotografias (Meshy AI), visualizador 360°, catálogo, orçamentos, assistente virtual e painel administrativo. **Toda a comunicação comercial segue para o WhatsApp +351 966 381 796.**

---

## 1. Arquitetura (custo fixo: 0 €)

| Peça | Serviço | Plano | Porquê |
|---|---|---|---|
| Site + backend (API) | **Netlify** | Gratuito (300 créditos/mês) | Permite **uso comercial** no plano gratuito (a Vercel gratuita não permite). |
| Base de dados + ficheiros | **Supabase** | Gratuito (500 MB BD, 1 GB ficheiros, 5 GB tráfego/mês) | Um só serviço para pedidos, catálogo, fotografias e cópias dos modelos 3D. |
| IA 3D | **Meshy AI** | A sua subscrição | Única despesa variável (créditos por geração). |
| Mensagens | **WhatsApp Click to Chat** | Gratuito | Sem e-mail e sem plataformas pagas. |
| Anti-robôs | **Cloudflare Turnstile** | Gratuito (opcional, recomendado) | Impede que robôs gastem os seus créditos Meshy. |

**Tecnologias:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · React Three Fiber (animação 3D) · Google `<model-viewer>` (visualizador 360° com realidade aumentada no telemóvel).

### Como funciona a criação 3D
1. O cliente carrega a fotografia → o navegador reduz a imagem e envia-a **diretamente** para o Supabase através de uma URL assinada pelo servidor.
2. O servidor (`/api/meshy/generate`) valida limites anti-abuso e chama `POST https://api.meshy.ai/openapi/v1/image-to-3d` com a **chave secreta guardada só no servidor**.
3. O navegador consulta `/api/meshy/status/:id` a cada 4 s; o servidor consulta `GET /openapi/v1/image-to-3d/:id` e mostra o progresso.
4. Quando a Meshy termina, o servidor **copia a miniatura, o GLB e o STL para o Supabase**. A Meshy apaga os modelos ao fim de cerca de 3 dias, e assim o senhor fica sempre com uma cópia.
5. O cliente vê o modelo em 360°, aprova ou gera de novo, preenche os detalhes e carrega em **SOLICITAR ESTA PEÇA**. O WhatsApp abre com a mensagem completa: dados, link para ver o modelo em 3D (`/modelo/<id>`), links de download (GLB/STL), fotografia original e referência.
6. O pedido fica também registado no painel `/admin`.

---

## 2. Publicação passo a passo

### Passo 1 — Supabase (≈10 min)
1. Crie conta em https://supabase.com → **New project** (região: *West EU (Ireland)* ou *Central EU (Frankfurt)*). Guarde a palavra-passe da base de dados.
2. Abra **SQL Editor → New query**, cole todo o conteúdo de `supabase/schema.sql` e carregue em **Run**. Isto cria as tabelas, as regras de segurança, o bucket `media`, as 7 categorias e as configurações iniciais.
3. Em **Project Settings → API** copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - chave `anon` / *publishable* → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - chave `service_role` / *secret* → `SUPABASE_SERVICE_ROLE_KEY` (**secreta!**)

### Passo 2 — Chave Meshy
1. Entre em https://www.meshy.ai/developers/keys e crie uma API key (começa por `msy_`).
2. Recomendado: defina um **limite mensal de créditos** na própria chave, como proteção extra.
3. Guarde-a como `MESHY_API_KEY`. Nunca a coloque no código nem a envie por mensagem.

### Passo 3 — Código no GitHub
1. Crie um repositório **privado** no GitHub (ex.: `alvo-print-3d`).
2. Envie esta pasta (o `.gitignore` já impede o envio de ficheiros `.env`).

### Passo 4 — Netlify
1. https://app.netlify.com → **Add new site → Import an existing project** → escolha o repositório.
2. O Netlify deteta o Next.js automaticamente (`netlify.toml` já incluído).
3. Antes do primeiro deploy, abra **Site configuration → Environment variables** e adicione **todas** as variáveis do ficheiro `.env.example`:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.seudominio.pt` (ou o endereço `.netlify.app` provisório) |
| `NEXT_PUBLIC_SUPABASE_URL` | do Passo 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | do Passo 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | do Passo 1 (secreta) |
| `MESHY_API_KEY` | do Passo 2 (secreta) |
| `ADMIN_PASSWORD` | palavra-passe forte para o painel (12+ caracteres) |
| `ADMIN_SESSION_SECRET` | texto aleatório longo (ex.: gerado em https://www.random.org/strings ou `openssl rand -hex 32`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | opcional, ver Passo 5 |

4. **Deploy site**. Depois de alterar variáveis, faça sempre **Deploys → Trigger deploy**.

### Passo 5 — Proteção anti-robôs (recomendado, gratuito)
Cloudflare → **Turnstile → Add site** → domínio do site → modo *Managed*. Copie a *Site key* e a *Secret key* para as duas variáveis `TURNSTILE`. Sem estas chaves o site funciona na mesma, protegido apenas pelos limites diários.

### Passo 6 — Domínio
1. Registe o domínio (ex.: `alvoprint3d.pt` num registador .PT como PTisp, Amen ou Dominios.pt; custa à volta de 10–20 €/ano e é o único custo fixo).
2. Netlify → **Domain management → Add a domain** → siga as instruções DNS (registo `CNAME www` → `<site>.netlify.app` e `A @` → IP indicado pelo Netlify). O certificado HTTPS é gratuito e automático.
3. Atualize `NEXT_PUBLIC_SITE_URL` e faça novo deploy.

### Passo 7 — Google
1. https://search.google.com/search-console → adicione o domínio → envie `https://www.seudominio.pt/sitemap.xml`.
2. Crie/atualize o **Perfil da Empresa no Google** (Évora) com o link do site — é o que mais ajuda nas pesquisas "impressão 3D Évora".

---

## 3. Painel administrativo — `/admin`

Entre com a `ADMIN_PASSWORD`.
- **Pedidos** — todos os orçamentos, encomendas de peças IA, pedidos de empresas e de produtos, com o texto enviado, links do modelo e anexos. Estados: novo / em contacto / concluído / arquivado.
- **Gerações 3D** — fotografia original e resultado lado a lado, ver em 3D, descarregar GLB/STL, créditos consumidos, apagar (liberta espaço).
- **Produtos** — adicionar, editar, remover, fotografias (a primeira é a capa), preço opcional (vazio = "Solicitar orçamento"), destaque na página inicial.
- **Categorias** — criar, editar, ordenar.
- **Empresa & Meshy** — WhatsApp, cidade, redes sociais, condições para ilhas; ligar/pausar a criação IA, modelo de IA, polígonos, formatos guardados, **limites diários** (por visitante e total), saldo de créditos Meshy.

> As chaves API **não** se editam no painel, por segurança. Ficam apenas nas variáveis de ambiente do Netlify.

---

## 4. Proteção dos créditos Meshy
- Limite por visitante (por omissão 3 por dia) e limite total do site (por omissão 25 por dia), ajustáveis no painel.
- Turnstile opcional contra robôs.
- Moderação de conteúdo da Meshy ativa por omissão.
- Interruptor no painel para pausar a criação IA a qualquer momento.
- Sem chave configurada, o site **não simula**: mostra "disponível em breve" e encaminha para o WhatsApp.

## 5. Limites do plano gratuito a vigiar
- **Supabase 1 GB de ficheiros**: cada geração (foto + GLB + STL) ocupa tipicamente alguns MB a algumas dezenas de MB. Apague no painel as gerações que não interessam. Se crescer, o plano Pro do Supabase custa cerca de 25 $/mês. O armazenamento também pode passar para o Cloudflare R2 (10 GB grátis).
- **Supabase pausa projetos gratuitos após 7 dias sem atividade.** Com visitas regulares não acontece. Se acontecer, basta reativar no painel do Supabase.
- **Netlify 300 créditos/mês**: cada deploy gasta cerca de 15 créditos. Evite dezenas de deploys por mês.
- **Funções Netlify (limite de ~10 s)**: os ficheiros são copiados um de cada vez para caber neste limite. Se um ficheiro for muito grande e falhar, o sistema tenta de novo na consulta seguinte.

## 6. WhatsApp Business Cloud API (futuro, opcional)
A solução atual (Click to Chat) é gratuita e o cliente envia a mensagem com um toque. Para envio **automático** de ficheiros sem intervenção do cliente seria necessário: conta Meta Business verificada, número dedicado (o número deixa de funcionar na app normal do WhatsApp), modelos de mensagem aprovados e custo por conversa iniciada pela empresa. O registo de pedidos (`/api/requests`) é o ponto onde essa integração se ligaria. **Não foi ativada**, conforme pedido.

## 7. Assistente virtual "Filo"
Robô animado no canto inferior direito, com respostas e fluxos predefinidos (gratuito): impressão 3D, criação com IA, materiais (orientação geral), entrega e ilhas, empresas, encomendas, e ajuda a escolher o serviço. **Não inventa preços, prazos nem características**: nesses casos encaminha para o WhatsApp.
Opcional e pago: definir `ASSISTANT_ANTHROPIC_API_KEY` ativa respostas de IA generativa apenas para perguntas fora dos fluxos, com as mesmas regras.

## 8. Desenvolvimento local
```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev                  # http://localhost:3000
npm test                     # testes da lógica do WhatsApp e do assistente
npm run build                # verificação de produção
```

## 9. Notas legais
- Página `/privacidade` incluída como texto-base (RGPD). Recomenda-se revisão por um profissional.
- Link para o Livro de Reclamações Eletrónico no rodapé (obrigatório para empresas em Portugal).
