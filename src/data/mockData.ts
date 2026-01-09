import { Product } from "@/components/products/ProductCard";
import { UserProfile } from "@/types/member";
import { Notification } from "@/types/notification";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Camisas",
    slug: "camisas",
    image: "https://images.unsplash.com/photo-1625910513413-5fc7974e9b3c?w=400&q=80",
    description: "Polos, camisetas e streetwear",
  },
  {
    id: "2",
    name: "Calçados",
    slug: "calcados",
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&q=80",
    description: "Tênis e sapatos de grife",
  },
  {
    id: "3",
    name: "Acessórios",
    slug: "acessorios",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80",
    description: "Relógios, óculos e bolsas",
  },
  {
    id: "4",
    name: "Grifes",
    slug: "grifes",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    description: "Produtos de marcas premium",
  },
  {
    id: "5",
    name: "Eletrônicos",
    slug: "eletronicos",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    description: "Gadgets e acessórios tech",
  },
];

export const currentUser: UserProfile = {
  id: "1",
  name: "João Silva",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
  tier: "gold",
  email: "joao.silva@email.com",
  phone: "(11) 99999-9999",
  memberSince: "Janeiro 2024",
  stats: {
    productsBought: 12,
    suppliersConnected: 8,
    daysInCommunity: 156,
  },
};

export const mockMembers: UserProfile[] = [
  {
    id: "2",
    name: "Maria Santos",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    tier: "platinum",
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    tier: "gold",
  },
  {
    id: "4",
    name: "Ana Costa",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    tier: "active",
  },
  {
    id: "5",
    name: "Pedro Mendes",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    tier: "founder",
  },
  {
    id: "6",
    name: "Juliana Ferreira",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    tier: "gold",
  },
  {
    id: "7",
    name: "Lucas Almeida",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
    tier: "member",
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Camisa Polo Premium Lacoste Style",
    image: "https://images.unsplash.com/photo-1625910513413-5fc7974e9b3c?w=400&q=80",
    originPrice: "R$ 45,00",
    resaleRange: "R$ 120 - 180",
    status: "hot",
    category: "Camisas",
    adminNote: "Giro testado em 3 cidades. Estoque na China com entrega rápida.",
    affiliateLink: "#",
  },
  {
    id: "2",
    name: "Tênis Nike Air Force Inspired",
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&q=80",
    originPrice: "R$ 89,00",
    resaleRange: "R$ 200 - 280",
    status: "trending",
    category: "Calçados",
    adminNote: "Alta demanda no inverno. Verificar tamanhos disponíveis.",
    affiliateLink: "#",
  },
  {
    id: "3",
    name: "Relógio Casual Minimalista",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80",
    originPrice: "R$ 32,00",
    resaleRange: "R$ 89 - 120",
    status: "new",
    category: "Acessórios",
    adminNote: "Novo no catálogo. Ótimo para testar mercado.",
    affiliateLink: "#",
  },
  {
    id: "4",
    name: "Camiseta Oversized Streetwear",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80",
    originPrice: "R$ 28,00",
    resaleRange: "R$ 75 - 110",
    status: "hot",
    category: "Camisas",
    adminNote: "Best-seller absoluto. Não falta estoque.",
    affiliateLink: "#",
  },
  {
    id: "5",
    name: "Óculos de Sol Vintage",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80",
    originPrice: "R$ 18,00",
    resaleRange: "R$ 55 - 85",
    status: "trending",
    category: "Acessórios",
    affiliateLink: "#",
  },
  {
    id: "6",
    name: "Bolsa Crossbody Compacta",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
    originPrice: "R$ 42,00",
    resaleRange: "R$ 110 - 150",
    status: "new",
    category: "Acessórios",
    adminNote: "Perfeita para público jovem. Cores vibrantes disponíveis.",
    affiliateLink: "#",
  },
];

// mockNotifications removed - now using real-time notifications from database

export interface Supplier {
  id: string;
  name: string;
  status: "active" | "paused" | "new";
  rating: {
    quality: number;
    delivery: number;
    communication: number;
  };
  categories: string[];
  adminNote?: string;
  contact?: string;
  link?: string;
}

export const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Quality Imports China",
    status: "active",
    rating: { quality: 4.8, delivery: 4.5, communication: 4.9 },
    categories: ["Camisas", "Acessórios"],
    adminNote: "Fornecedor principal. Resposta rápida no WhatsApp.",
    link: "https://wa.me/5511999999999",
  },
  {
    id: "2",
    name: "Fast Fashion Hub",
    status: "active",
    rating: { quality: 4.3, delivery: 4.8, communication: 4.2 },
    categories: ["Calçados", "Streetwear"],
    adminNote: "Especializado em tênis. Entrega expressa disponível.",
    link: "https://fastfashionhub.com",
  },
  {
    id: "3",
    name: "Premium Accessories Co",
    status: "paused",
    rating: { quality: 4.6, delivery: 3.8, communication: 4.0 },
    categories: ["Acessórios", "Relógios"],
    adminNote: "Em pausa por atraso em entregas. Aguardando normalização.",
  },
  {
    id: "4",
    name: "Urban Style Direct",
    status: "new",
    rating: { quality: 4.5, delivery: 4.5, communication: 4.7 },
    categories: ["Camisas", "Grifes"],
    adminNote: "Novo parceiro. Em fase de teste com primeiros pedidos.",
    link: "https://t.me/urbanstyledirect",
  },
];
