

# Plano: Correcao Estetica Global do Hub 26

## Problemas Identificados

### 1. Divisao branca no conteudo principal
O `AppLayout.tsx` aplica `bg-ambient` no wrapper, mas o `<main>` nao herda o fundo corretamente. A classe `bg-ambient::before` usa `position: fixed` o que funciona, porem o conteudo dentro do `<main>` (e as paginas como Home) nao tem fundo transparente -- no tema claro, o `--background` e quase branco (`0 0% 98%`), criando uma "divisao" visivel entre a navbar (que tem blur/glass) e o conteudo abaixo.

A Home tambem tem `bg-gradient-radial` que faz fade para `hsl(var(--background))`, o que no tema claro cria uma mancha branca solida.

### 2. Cards de produtos e videos sem efeito "glass"
Os cards de produto (`ProductCard.tsx`) usam `bg-transparent` e os de video (`VideoCard.tsx`) usam `bg-card` sem blur nem borda glass. Falta o acabamento "vidro escuro premium" da referencia.

---

## Mudancas Planejadas

### Etapa 1 -- Corrigir o fundo global (eliminar a divisao branca)

**Arquivo: `src/index.css`**
- No tema `.light`, escurecer o `--background` para um tom mais escuro/neutro que nao quebre a atmosfera, OU (melhor abordagem) garantir que o `bg-ambient::before` funcione tambem no light mode com gradientes equivalentes usando cores do tema claro.
- Ajustar `.bg-gradient-radial` para usar opacidade e nao cor solida, evitando a "mancha branca".
- Adicionar variante light do `.bg-ambient::before` que use gradientes teal suaves sobre fundo claro.

**Arquivo: `src/components/layout/AppLayout.tsx`**
- Garantir que o `<main>` tenha `bg-transparent` explicito para que o fundo ambient passe por baixo sem interrupcao.

**Arquivo: `src/pages/Home.tsx`**
- Ajustar o `bg-gradient-radial` overlay para nao criar bloco solido -- usar opacidade mais baixa.

### Etapa 2 -- Aplicar efeito "glass" nos cards de produtos e videos

**Arquivo: `src/components/products/ProductCard.tsx`**
- Trocar `bg-transparent` por efeito glass: `bg-card/40 backdrop-blur-sm border border-white/[0.06]`
- Adicionar hover com glow sutil: `hover:border-white/[0.1] hover:shadow-card`

**Arquivo: `src/components/videos/VideoCard.tsx`**
- Trocar `bg-card` por glass equivalente: `bg-card/40 backdrop-blur-sm border-white/[0.06]`
- Manter o hover existente mas adicionar transicao de borda/sombra

**Arquivo: `src/components/products/ProductCardSkeleton.tsx`**
- Alinhar visual do skeleton com o estilo glass dos cards

### Etapa 3 -- Refinar hover e micro-interacoes

**Arquivo: `src/index.css`**
- Ajustar `.card-hover:hover` para usar aumento sutil de luminosidade em vez de cor solida
- Garantir que `glass-card` tenha transicao suave no hover

---

## Detalhes Tecnicos

### CSS -- Correcao do bg-ambient para light mode
Adicionar media/class query em `.bg-ambient::before` que use gradientes com opacidades adequadas para fundo claro (tons teal sobre cinza claro, em vez de sobre preto).

### Glass Card Pattern
```text
background: hsl(var(--card) / 0.4)
backdrop-filter: blur(12px)
border: 1px solid hsl(0 0% 100% / 0.06)   (dark)
        1px solid hsl(0 0% 0% / 0.06)      (light)
transition: border-color 200ms, box-shadow 200ms
hover: border-color + shadow-card sutil
```

### Arquivos modificados (total: 5)
1. `src/index.css` -- bg-ambient light mode, glass refinements, gradient fix
2. `src/components/layout/AppLayout.tsx` -- main transparent
3. `src/pages/Home.tsx` -- gradient overlay opacity
4. `src/components/products/ProductCard.tsx` -- glass card
5. `src/components/videos/VideoCard.tsx` -- glass card

### Sem alteracoes em:
- Layout, posicao de elementos, icones
- Fluxos, rotas, logica
- Dados ou permissoes

