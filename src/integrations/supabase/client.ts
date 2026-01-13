// ============================================================================
// AUDITORIA DE SEGURANÇA - 10/01/2026
// ============================================================================
// 
// PROBLEMA ORIGINAL:
// Este projeto foi gerado pelo Lovable.dev que gerencia seu próprio Supabase.
// Ao exportar o código, o .env mantinha as credenciais do Supabase do Lovable,
// fazendo com que o app continuasse conectando ao backend DELES mesmo rodando
// localmente.
//
// CAUSA RAIZ:
// - O arquivo .env continha: VITE_SUPABASE_URL apontando para o projeto Lovable
// - NÃO havia validação das env vars - o app rodava com undefined sem erro
// - O localStorage mantinha tokens de sessão antigos
//
// CORREÇÕES APLICADAS:
// 1. Adicionada validação obrigatória das env vars (app falha se ausentes)
// 2. Removido lovable-tagger do package.json
// 3. Removido componentTagger() do vite.config.ts
// 4. Removidos metadados Lovable do index.html
//
// PARA MIGRAR COMPLETAMENTE:
// 1. Crie um novo projeto no Supabase Dashboard (https://supabase.com)
// 2. Execute o arquivo supabase/SETUP_COMPLETO.sql no SQL Editor
// 3. Atualize o .env com as novas credenciais (URL e anon key do SEU projeto)
// 4. Limpe o localStorage do navegador (F12 > Application > Clear Site Data)
//
// AUDITORIA CONCLUÍDA: Nenhuma dependência do Lovable permanece ativa no código.
// O único ponto de conexão é o arquivo .env que VOCÊ deve atualizar.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Leitura das variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// ============================================================================
// VALIDAÇÃO OBRIGATÓRIA - O app DEVE falhar se as credenciais não existirem
// ============================================================================
if (!SUPABASE_URL) {
  throw new Error(
    '[ERRO FATAL] VITE_SUPABASE_URL não está definida.\n' +
    'Crie um arquivo .env na raiz do projeto com:\n' +
    'VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui'
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    '[ERRO FATAL] VITE_SUPABASE_ANON_KEY não está definida.\n' +
    'Crie um arquivo .env na raiz do projeto com:\n' +
    'VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui'
  );
}

// Validação de formato da URL
if (!SUPABASE_URL.includes('supabase.co') && !SUPABASE_URL.includes('localhost')) {
  console.warn(
    '[AVISO] VITE_SUPABASE_URL não parece ser uma URL válida do Supabase:',
    SUPABASE_URL
  );
}

// ============================================================================
// CLIENTE ÚNICO DO SUPABASE
// ============================================================================
// Este é o ÚNICO ponto de conexão com o Supabase em todo o projeto.
// Todos os hooks e componentes importam deste arquivo.
// ============================================================================

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Log de confirmação (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('[Supabase] Conectado a:', SUPABASE_URL.replace(/https:\/\/([^.]+)\..*/, '$1'));
}
