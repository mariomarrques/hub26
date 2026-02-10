

# Plano: Correcao da Divisao de Cores, Padding dos Cards e Navbar Mobile

## Problemas Identificados

### 1. "Quadrado" / divisao branca na Home
A Home renderiza dentro do `AppLayout`, que aplica `py-xl` no wrapper de conteudo. Esse padding cria um "bloco" visivel entre a navbar e o conteudo da Home. Alem disso, o `bg-gradient-radial` na Home usa `hsl(var(--background) / 0.5)` que no tema claro gera uma mancha esbranquicada. O proprio `body` com `bg-background` cria a base branca que aparece onde o `bg-ambient::before` nao consegue cobrir adequadamente no light mode.

**Solucao:**
- No `AppLayout.tsx`, a Home precisa de tratamento especial: quando o children for a Home (full-bleed), o padding `py-xl` nao deve ser aplicado. A abordagem mais simples e remover o `py-xl` do wrapper global e deixar cada pagina controlar seu proprio padding.
- Alternativa mais cirurgica: manter o layout atual mas garantir que o `bg-ambient::before` cubra 100% da tela em ambos os temas, e ajustar o `--background` do light mode para nao ser branco puro.
- Ajustar `.light --background` de `0 0% 98%` (quase branco) para um tom levemente acinzentado/azulado que nao quebre a atmosfera.
- Ajustar `.bg-gradient-radial` para usar `transparent` no destino em vez de `hsl(var(--background))`.

### 2. Cards de produtos precisam de mais "respiro" (padding interno)
O conteudo textual dos cards (titulo, preco, botao) esta muito colado nas bordas. Precisa de mais padding horizontal interno.

**Solucao:**
- No `ProductCard.tsx`, aumentar o `px-1` do container de conteudo para `px-3` e ajustar `pb-1` para `pb-3`, dando mais respiro ao texto e botoes.

### 3. Navbar cortando elementos no iPad/mobile
No mobile (390px) e tablet, a navbar central ocupa espaco demais, empurrando ou escondendo os botoes da direita (tema, notificacoes, perfil/avatar). O perfil dropdown fica inacessivel.

**Solucao:**
- Reduzir o padding dos itens da navbar em telas pequenas: `px-2` no mobile em vez de `px-3`.
- Usar `overflow-x-auto` na nav para permitir scroll horizontal se necessario.
- Reduzir `gap-1` para `gap-0` na area direita em mobile.
- Garantir que os botoes da direita (`flex-shrink-0`) nunca sejam comprimidos.
- Considerar esconder o texto "Hub 26" do logo em telas menores (ja esta `hidden sm:block`, confirmar que funciona).

---

## Mudancas por Arquivo

### 1. `src/index.css`
- Ajustar `.light --background` de `0 0% 98%` para algo como `210 20% 96%` (cinza levemente azulado, nao branco puro).
- Alterar `.bg-gradient-radial` para usar `transparent` como destino: `radial-gradient(ellipse at center, transparent 0%, transparent 70%)` ou simplesmente reduzir a opacidade drasticamente.
- Fortalecer o `.light .bg-ambient::before` com opacidades um pouco maiores para que o teal sutil apareca melhor sobre fundo claro.

### 2. `src/components/layout/AppLayout.tsx`
- Manter a estrutura atual mas garantir `bg-transparent` no main.
- A Home ja nao precisa de `py-xl` no topo -- vou ajustar para `py-4 md:py-6` que e mais sutil, ou manter `py-xl` mas garantir que o Home preencha visualmente.

### 3. `src/pages/Home.tsx`
- Remover ou reduzir o `bg-gradient-radial opacity-60` que cria a mancha. Trocar para `opacity-30` ou remover completamente, ja que o `bg-ambient` ja fornece o efeito de fundo.

### 4. `src/components/products/ProductCard.tsx`
- Aumentar padding do conteudo: `px-1` para `px-3`, `pb-1` para `pb-3`.

### 5. `src/components/layout/AppHeader.tsx`
- Na nav central: adicionar `overflow-x-auto max-w-[60vw] md:max-w-none` para evitar que empurre os botoes da direita.
- Nos itens da nav: reduzir padding mobile para `px-2 md:px-4`.
- Na area direita: adicionar `flex-shrink-0` para garantir que nunca seja comprimida.
- Reduzir tamanho dos botoes em mobile se necessario (`h-8 w-8` em vez de `h-9 w-9`).

---

## Arquivos Modificados (total: 5)
1. `src/index.css` -- light background, gradient fix, ambient light mode
2. `src/components/layout/AppLayout.tsx` -- padding ajustado
3. `src/pages/Home.tsx` -- remover mancha do gradient
4. `src/components/products/ProductCard.tsx` -- mais padding interno
5. `src/components/layout/AppHeader.tsx` -- navbar responsiva, area direita protegida

## Sem alteracoes em:
- Layout estrutural, posicao de elementos, icones
- Fluxos, rotas, logica
- Dados ou permissoes

