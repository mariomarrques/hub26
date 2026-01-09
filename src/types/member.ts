export type MemberTier = 'member' | 'active' | 'gold' | 'platinum' | 'founder';

export interface MemberLevel {
  tier: MemberTier;
  name: string;
  color: string;
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  tier: MemberTier;
  email?: string;
  phone?: string;
  memberSince?: string;
  stats?: {
    productsBought: number;
    suppliersConnected: number;
    daysInCommunity: number;
  };
}

export const MEMBER_LEVELS: Record<MemberTier, MemberLevel> = {
  member: {
    tier: 'member',
    name: 'Membro',
    color: 'text-muted-foreground',
    description: 'Membro da comunidade',
  },
  active: {
    tier: 'active',
    name: 'Membro Ativo',
    color: 'text-blue-400',
    description: 'Engajado na comunidade',
  },
  gold: {
    tier: 'gold',
    name: 'Membro Gold',
    color: 'text-yellow-400',
    description: 'Sempre ajudando a comunidade',
  },
  platinum: {
    tier: 'platinum',
    name: 'Membro Platina',
    color: 'text-slate-300',
    description: 'Referência na comunidade',
  },
  founder: {
    tier: 'founder',
    name: 'Membro Fundador',
    color: 'text-emerald-400',
    description: 'Membro desde o início',
  },
};
