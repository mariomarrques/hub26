

# Plano: Aumentar altura vertical das thumbnails de video

## Mudanca

### Arquivo: `src/components/videos/VideoCard.tsx` (linha 16)
- Trocar `aspect-video` (16:9) por aspect ratio 9:14 (portrait/vertical)
- Usar estilo inline: `style={{ aspectRatio: '9/14' }}` e remover a classe `aspect-video`
- Aplicar a mesma mudanca no skeleton de loading na pagina `src/pages/Videos.tsx` (linha 68) para manter consistencia visual durante o carregamento

## Arquivos modificados (total: 2)
1. `src/components/videos/VideoCard.tsx` -- aspect ratio 9:14
2. `src/pages/Videos.tsx` -- skeleton com mesmo aspect ratio

