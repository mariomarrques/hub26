
# Plano: Corrigir Navbar - Remover Scroll e Consertar Dropdowns

## Problema
O `overflow-x-auto` adicionado na `<nav>` causa:
1. Scroll horizontal ridiculo na navbar
2. Os dropdowns (CSSBuy, Catalogo) abrem DENTRO do container da nav, ficando cortados pelo overflow, forcando o usuario a scrollar para ver o conteudo

## Solucao
Remover completamente o `overflow-x-auto` e `scrollbar-none` da nav. Em vez disso, a navbar ja mostra apenas icones no mobile (`hidden md:inline` nos labels), entao ela cabe naturalmente. Basta garantir que o container nao force overflow.

## Mudancas

### Arquivo: `src/components/layout/AppHeader.tsx` (linha 80)
- Remover `overflow-x-auto` e `scrollbar-none` da classe da `<nav>`
- Manter `max-w-[55vw] md:max-w-none` para limitar a largura sem criar scroll
- Adicionar `overflow-visible` para garantir que os dropdowns aparecem fora do container da nav

Classe atual:
```
flex items-center gap-0.5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-full px-1.5 py-1 overflow-x-auto max-w-[55vw] md:max-w-none scrollbar-none
```

Classe corrigida:
```
flex items-center gap-0.5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-full px-1.5 py-1 overflow-visible max-w-[55vw] md:max-w-none
```

## Resultado
- Sem scroll horizontal na navbar
- Dropdowns do CSSBuy e Catalogo abrem normalmente abaixo da navbar, visiveis e clicaveis
- No mobile, apenas icones aparecem (ja funciona assim), entao tudo cabe sem scroll
