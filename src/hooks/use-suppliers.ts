import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type SupplierRow = Tables<"suppliers">;
type ReviewRow = Tables<"reviews">;
type ReviewInsert = TablesInsert<"reviews">;
type LegacySupplierRow = Pick<SupplierRow, "id" | "name" | "link" | "contact" | "admin_note">;
type LegacyAdminSupplierRow = Pick<
  SupplierRow,
  "id" | "name" | "status" | "link" | "contact" | "admin_note" | "created_at"
>;
type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

interface SupplierBase {
  id: string;
  name: string;
  avatar_url: string | null;
  country: string | null;
  shipping_method: string | null;
  prep_time: string | null;
  shipping_time: string | null;
  description: string | null;
  whatsapp_link: string | null;
  group_link: string | null;
  links: SupplierLinkItem[];
}

export interface SupplierListItem extends SupplierBase {
  average_rating: number;
  reviews_count: number;
}

export interface SupplierReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  image_url: string | null;
  created_at: string;
  reviewer: {
    name: string;
    avatar_url: string | null;
  };
}

export interface SupplierDetails extends SupplierBase {
  average_rating: number;
  reviews_count: number;
  reviews: SupplierReviewItem[];
}

export interface SubmitSupplierReviewInput {
  supplier_id: string;
  rating: number;
  comment?: string;
  image_url?: string | null;
}

export const SUPPLIER_STATUS_VALUES = ["pending", "approved", "rejected"] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUS_VALUES)[number];

export const SUPPLIER_LINK_TYPE_VALUES = ["whatsapp", "group", "instagram", "site"] as const;
export type SupplierLinkType = (typeof SUPPLIER_LINK_TYPE_VALUES)[number];

export interface SupplierLinkItem {
  type: SupplierLinkType;
  url: string;
}

export interface AdminSupplierInput {
  name: string;
  avatar_url?: string | null;
  country?: string | null;
  shipping_method?: string | null;
  prep_time?: string | null;
  shipping_time?: string | null;
  description?: string | null;
  whatsapp_link?: string | null;
  group_link?: string | null;
  links?: SupplierLinkItem[];
  status: SupplierStatus;
}

export interface AdminSupplierUpdateInput extends AdminSupplierInput {
  id: string;
}

export interface AdminSupplierListItem extends SupplierBase {
  status: SupplierStatus;
  created_at: string;
}

const normalizeSupplier = (
  row: Pick<
    SupplierRow,
    | "id"
    | "name"
    | "avatar_url"
    | "country"
    | "shipping_method"
    | "prep_time"
    | "shipping_time"
    | "whatsapp_link"
    | "group_link"
  >
): SupplierBase => ({
  id: row.id,
  name: row.name,
  avatar_url: row.avatar_url ?? null,
  country: row.country ?? null,
  shipping_method: row.shipping_method ?? null,
  prep_time: row.prep_time ?? null,
  shipping_time: row.shipping_time ?? null,
  description: null,
  whatsapp_link: row.whatsapp_link ?? null,
  group_link: row.group_link ?? null,
  links: buildLinksFromColumns(row.whatsapp_link, row.group_link),
});

const buildReviewStats = (
  reviews: Array<Pick<ReviewRow, "supplier_id" | "rating">>
) => {
  const statsMap = new Map<string, { count: number; sum: number }>();

  reviews.forEach((review) => {
    const current = statsMap.get(review.supplier_id) || { count: 0, sum: 0 };
    current.count += 1;
    current.sum += Number(review.rating) || 0;
    statsMap.set(review.supplier_id, current);
  });

  return statsMap;
};

function isMissingColumnError(error: unknown, column?: string) {
  const e = error as SupabaseErrorLike | null;
  if (!e || (e.code !== "42703" && e.code !== "PGRST204")) return false;
  if (!column) return true;
  return (e.message || "").includes(column);
}

function isMissingRelationError(error: unknown) {
  const e = error as SupabaseErrorLike | null;
  return !!e && (e.code === "42P01" || e.code === "PGRST205");
}

function logSupabaseError(context: string, error: unknown) {
  if (!import.meta.env.DEV) return;
  const e = error as SupabaseErrorLike | null;
  console.error(`[Supabase:${context}]`, {
    code: e?.code,
    message: e?.message,
    details: e?.details,
    hint: e?.hint,
  });
}

function getSupabaseErrorMessage(error: unknown): string {
  const e = error as SupabaseErrorLike | null;

  if (error instanceof Error && error.message) return error.message;
  if (e?.message) return e.message;

  return "Não foi possível concluir a operação no momento.";
}

function mapLegacySupplier(row: LegacySupplierRow): SupplierBase {
  const meta = parseLegacySupplierMeta(row.admin_note);
  const links = getNormalizedSupplierLinks(meta?.links, row.link ?? null, null);
  const whatsappLink = getPrimaryLinkByType(links, "whatsapp") || (row.link ?? null);
  const groupLink = getPrimaryLinkByType(links, "group");

  return {
    id: row.id,
    name: row.name,
    avatar_url: meta?.avatar_url ?? null,
    country: row.contact ?? null,
    shipping_method: meta?.shipping_method ?? null,
    prep_time: meta?.prep_time ?? null,
    shipping_time: meta?.shipping_time ?? null,
    description: meta?.description ?? null,
    whatsapp_link: whatsappLink,
    group_link: groupLink,
    links,
  };
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

type LegacySupplierMeta = {
  description?: string | null;
  avatar_url?: string | null;
  shipping_method?: string | null;
  prep_time?: string | null;
  shipping_time?: string | null;
  links?: SupplierLinkItem[];
};

const LEGACY_SUPPLIER_META_PREFIX = "__supplier_meta_v1__:";

function buildLinksFromColumns(
  whatsappLink?: string | null,
  groupLink?: string | null
): SupplierLinkItem[] {
  const links: SupplierLinkItem[] = [];

  if (whatsappLink) links.push({ type: "whatsapp", url: whatsappLink });
  if (groupLink) links.push({ type: "group", url: groupLink });

  return links;
}

function getNormalizedSupplierLinks(
  links?: SupplierLinkItem[] | null,
  fallbackWhatsapp?: string | null,
  fallbackGroup?: string | null
): SupplierLinkItem[] {
  const baseLinks = (links || [])
    .filter((link) => SUPPLIER_LINK_TYPE_VALUES.includes(link.type))
    .map((link) => ({
      type: link.type,
      url: link.url.trim(),
    }))
    .filter((link) => !!link.url);

  const hasWhatsapp = baseLinks.some((link) => link.type === "whatsapp");
  const hasGroup = baseLinks.some((link) => link.type === "group");

  if (fallbackWhatsapp && !hasWhatsapp) {
    baseLinks.unshift({ type: "whatsapp", url: fallbackWhatsapp });
  }

  if (fallbackGroup && !hasGroup) {
    baseLinks.push({ type: "group", url: fallbackGroup });
  }

  return baseLinks;
}

function getPrimaryLinkByType(links: SupplierLinkItem[], type: SupplierLinkType): string | null {
  return links.find((link) => link.type === type)?.url || null;
}

function getPrimaryContactLink(links: SupplierLinkItem[]): string | null {
  return links[0]?.url || null;
}

function parseLegacySupplierMeta(adminNote?: string | null): LegacySupplierMeta | null {
  if (!adminNote) return null;

  if (!adminNote.startsWith(LEGACY_SUPPLIER_META_PREFIX)) {
    return { description: adminNote };
  }

  const rawJson = adminNote.replace(LEGACY_SUPPLIER_META_PREFIX, "");

  try {
    const parsed = JSON.parse(rawJson) as LegacySupplierMeta;
    const links = getNormalizedSupplierLinks(parsed.links || []);

    return {
      description: normalizeOptionalText(parsed.description),
      avatar_url: normalizeOptionalText(parsed.avatar_url),
      shipping_method: normalizeOptionalText(parsed.shipping_method),
      prep_time: normalizeOptionalText(parsed.prep_time),
      shipping_time: normalizeOptionalText(parsed.shipping_time),
      links,
    };
  } catch {
    return { description: adminNote };
  }
}

function buildLegacySupplierMeta(input: AdminSupplierInput): string | null {
  const description = normalizeOptionalText(input.description);
  const avatar_url = normalizeOptionalText(input.avatar_url);
  const shipping_method = normalizeOptionalText(input.shipping_method);
  const prep_time = normalizeOptionalText(input.prep_time);
  const shipping_time = normalizeOptionalText(input.shipping_time);

  const links = getNormalizedSupplierLinks(
    input.links,
    normalizeOptionalText(input.whatsapp_link),
    normalizeOptionalText(input.group_link)
  );

  const payload: LegacySupplierMeta = {
    description,
    avatar_url,
    shipping_method,
    prep_time,
    shipping_time,
    links,
  };

  const hasContent = Boolean(
    payload.description ||
      payload.avatar_url ||
      payload.shipping_method ||
      payload.prep_time ||
      payload.shipping_time ||
      (payload.links && payload.links.length > 0)
  );

  if (!hasContent) return null;

  return `${LEGACY_SUPPLIER_META_PREFIX}${JSON.stringify(payload)}`;
}

function buildSupplierAdminPayload(input: AdminSupplierInput): TablesInsert<"suppliers"> {
  const normalizedStatus: SupplierStatus = SUPPLIER_STATUS_VALUES.includes(input.status)
    ? input.status
    : "pending";

  const links = getNormalizedSupplierLinks(
    input.links,
    normalizeOptionalText(input.whatsapp_link),
    normalizeOptionalText(input.group_link)
  );

  return {
    name: input.name.trim(),
    avatar_url: normalizeOptionalText(input.avatar_url),
    country: normalizeOptionalText(input.country),
    shipping_method: normalizeOptionalText(input.shipping_method),
    prep_time: normalizeOptionalText(input.prep_time),
    shipping_time: normalizeOptionalText(input.shipping_time),
    whatsapp_link: getPrimaryLinkByType(links, "whatsapp"),
    group_link: getPrimaryLinkByType(links, "group"),
    status: normalizedStatus,
    // Compatibilidade temporária até remoção definitiva de is_approved.
    is_approved: normalizedStatus === "approved",
  };
}

function buildLegacySupplierCreatePayload(input: AdminSupplierInput): TablesInsert<"suppliers"> {
  const links = getNormalizedSupplierLinks(
    input.links,
    normalizeOptionalText(input.whatsapp_link),
    normalizeOptionalText(input.group_link)
  );

  return {
    name: input.name.trim(),
    status: input.status,
    // Compatibilidade com schema legado que ainda usa link/contact/admin_note.
    link: getPrimaryContactLink(links),
    contact: normalizeOptionalText(input.country),
    admin_note: buildLegacySupplierMeta(input),
  };
}

function buildLegacySupplierUpdatePayload(input: AdminSupplierInput): TablesUpdate<"suppliers"> {
  const links = getNormalizedSupplierLinks(
    input.links,
    normalizeOptionalText(input.whatsapp_link),
    normalizeOptionalText(input.group_link)
  );

  return {
    name: input.name.trim(),
    status: input.status,
    link: getPrimaryContactLink(links),
    contact: normalizeOptionalText(input.country),
    admin_note: buildLegacySupplierMeta(input),
  };
}

function mapLegacyAdminSupplier(row: LegacyAdminSupplierRow): AdminSupplierListItem {
  const base = mapLegacySupplier(row);

  return {
    ...base,
    status: normalizeSupplierStatus(row.status),
    created_at: row.created_at || new Date().toISOString(),
  };
}

function normalizeSupplierStatus(status?: string | null): SupplierStatus {
  if (status && SUPPLIER_STATUS_VALUES.includes(status as SupplierStatus)) {
    return status as SupplierStatus;
  }
  return "pending";
}

async function fetchApprovedSuppliersBase(): Promise<SupplierBase[]> {
  const { data: suppliersData, error: suppliersError } = await supabase
    .from("suppliers")
    .select(
      "id, name, avatar_url, country, shipping_method, prep_time, shipping_time, whatsapp_link, group_link"
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (!suppliersError) {
    return (suppliersData || []).map(normalizeSupplier);
  }
  logSupabaseError("suppliers.fetch.primary", suppliersError);

  // Compatibilidade defensiva com schema legado (status/link) quando faltar coluna.
  if (!isMissingColumnError(suppliersError)) {
    throw suppliersError;
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("suppliers")
    .select("id, name, link, contact, admin_note")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (legacyError) {
    logSupabaseError("suppliers.fetch.legacy", legacyError);
    throw legacyError;
  }

  return (legacyData || []).map((row) => mapLegacySupplier(row as LegacySupplierRow));
}

async function fetchApprovedReviewStats(supplierIds: string[]) {
  const { data: reviewsData, error: reviewsError } = await supabase
    .from("reviews")
    .select("supplier_id, rating")
    .eq("is_approved", true)
    .in("supplier_id", supplierIds);

  if (reviewsError) {
    logSupabaseError("reviews.stats", reviewsError);

    // Se a tabela/coluna de reviews não existir ainda, zeramos as métricas sem quebrar a página.
    if (isMissingRelationError(reviewsError) || isMissingColumnError(reviewsError)) {
      return new Map<string, { count: number; sum: number }>();
    }
    throw reviewsError;
  }

  return buildReviewStats(
    (reviewsData || []) as Array<Pick<ReviewRow, "supplier_id" | "rating">>
  );
}

export function useApprovedSuppliers() {
  return useQuery({
    queryKey: ["suppliers", "approved"],
    retry: false,
    queryFn: async (): Promise<SupplierListItem[]> => {
      const suppliers = await fetchApprovedSuppliersBase();
      if (suppliers.length === 0) return [];

      const supplierIds = suppliers.map((supplier) => supplier.id);
      const statsMap = await fetchApprovedReviewStats(supplierIds);

      return suppliers.map((supplier) => {
        const stats = statsMap.get(supplier.id) || { count: 0, sum: 0 };
        const average_rating = stats.count > 0 ? Number((stats.sum / stats.count).toFixed(1)) : 0;

        return {
          ...supplier,
          average_rating,
          reviews_count: stats.count,
        };
      });
    },
  });
}

export function useSupplierDetails(supplierId?: string) {
  return useQuery({
    queryKey: ["suppliers", "details", supplierId],
    enabled: !!supplierId,
    retry: false,
    queryFn: async (): Promise<SupplierDetails | null> => {
      if (!supplierId) return null;

      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select(
          "id, name, avatar_url, country, shipping_method, prep_time, shipping_time, whatsapp_link, group_link"
        )
        .eq("id", supplierId)
        .eq("is_approved", true)
        .maybeSingle();

      let supplier: SupplierBase | null = null;

      if (!supplierError) {
        supplier = supplierData ? normalizeSupplier(supplierData) : null;
      } else if (isMissingColumnError(supplierError)) {
        logSupabaseError("supplier.details.primary", supplierError);
        const { data: legacyData, error: legacyError } = await supabase
          .from("suppliers")
          .select("id, name, link, contact, admin_note")
          .eq("id", supplierId)
          .eq("status", "approved")
          .maybeSingle();

        if (legacyError) {
          logSupabaseError("supplier.details.legacy", legacyError);
          throw legacyError;
        }
        supplier = legacyData ? mapLegacySupplier(legacyData as LegacySupplierRow) : null;
      } else {
        logSupabaseError("supplier.details.primary", supplierError);
        throw supplierError;
      }

      if (!supplier) return null;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("id, supplier_id, user_id, rating, comment, image_url, created_at")
        .eq("supplier_id", supplierId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (reviewsError && !isMissingRelationError(reviewsError) && !isMissingColumnError(reviewsError)) {
        logSupabaseError("reviews.details", reviewsError);
        throw reviewsError;
      }

      const reviews = (reviewsData || []) as Array<
        Pick<
          ReviewRow,
          | "id"
          | "supplier_id"
          | "user_id"
          | "rating"
          | "comment"
          | "image_url"
          | "created_at"
        >
      >;

      const reviewerIds = [...new Set(reviews.map((review) => review.user_id).filter(Boolean))];
      let profileMap = new Map<string, { name: string; avatar_url: string | null }>();

      if (reviewerIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", reviewerIds);

        if (!profilesError && profilesData) {
          profileMap = new Map(
            profilesData.map((profile) => [
              profile.id,
              {
                name: profile.name,
                avatar_url: profile.avatar_url,
              },
            ])
          );
        }
      }

      const reviewsWithReviewer: SupplierReviewItem[] = reviews.map((review) => ({
        id: review.id,
        rating: Number(review.rating),
        comment: review.comment,
        image_url: review.image_url,
        created_at: review.created_at,
        reviewer: profileMap.get(review.user_id) || {
          name: "Usuário",
          avatar_url: null,
        },
      }));

      const reviews_count = reviewsWithReviewer.length;
      const ratingSum = reviewsWithReviewer.reduce((sum, review) => sum + review.rating, 0);
      const average_rating = reviews_count > 0 ? Number((ratingSum / reviews_count).toFixed(1)) : 0;

      return {
        ...supplier,
        average_rating,
        reviews_count,
        reviews: reviewsWithReviewer,
      };
    },
  });
}

export function useSubmitSupplierReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitSupplierReviewInput) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      if (!input.supplier_id) throw new Error("Fornecedor é obrigatório");
      if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
        throw new Error("A nota deve ser um número inteiro entre 1 e 5");
      }

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          supplier_id: input.supplier_id,
          user_id: user.id,
          rating: input.rating,
          comment: input.comment?.trim() ? input.comment.trim() : null,
          image_url: input.image_url || null,
          is_approved: false,
        } satisfies ReviewInsert)
        .select("id, supplier_id, user_id, rating, comment, image_url, is_approved, created_at")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "approved"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", "details", variables.supplier_id] });
      toast.success("Avaliação enviada para aprovação!");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Não foi possível enviar sua avaliação.";
      toast.error(`Erro ao enviar avaliação: ${message}`);
    },
  });
}

export function useCreateSupplier() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AdminSupplierInput) => {
      if (!isAdmin) throw new Error("Apenas administradores podem cadastrar fornecedores.");

      const normalizedName = input.name.trim();
      if (!normalizedName) throw new Error("Nome do fornecedor é obrigatório.");

      const payload = buildSupplierAdminPayload({
        ...input,
        name: normalizedName,
      });

      const { data, error } = await supabase
        .from("suppliers")
        .insert(payload)
        .select()
        .single();

      if (!error) return data;

      logSupabaseError("suppliers.create.primary", error);

      // Fallback para instalações que ainda não aplicaram migração completa do schema.
      if (!isMissingColumnError(error)) throw error;

      const legacyPayload = buildLegacySupplierCreatePayload({
        ...input,
        name: normalizedName,
      });

      const { data: legacyData, error: legacyError } = await supabase
        .from("suppliers")
        .insert(legacyPayload)
        .select()
        .single();

      if (!legacyError) {
        return legacyData;
      }

      logSupabaseError("suppliers.create.legacy", legacyError);

      if (!isMissingColumnError(legacyError, "admin_note")) {
        throw legacyError;
      }

      const { admin_note, ...legacyPayloadWithoutNote } = legacyPayload;
      const { data: legacyDataWithoutNote, error: legacyErrorWithoutNote } = await supabase
        .from("suppliers")
        .insert(legacyPayloadWithoutNote)
        .select()
        .single();

      if (legacyErrorWithoutNote) {
        logSupabaseError("suppliers.create.legacyWithoutNote", legacyErrorWithoutNote);
        throw legacyErrorWithoutNote;
      }

      return legacyDataWithoutNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor cadastrado com sucesso!");
    },
    onError: (error) => {
      logSupabaseError("suppliers.create.onError", error);
      const message = getSupabaseErrorMessage(error);
      toast.error(`Erro ao cadastrar fornecedor: ${message}`);
    },
  });
}

export function useUpdateSupplier() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: AdminSupplierUpdateInput) => {
      if (!isAdmin) throw new Error("Apenas administradores podem editar fornecedores.");

      const normalizedName = input.name.trim();
      if (!normalizedName) throw new Error("Nome do fornecedor é obrigatório.");

      const payload = buildSupplierAdminPayload({
        ...input,
        name: normalizedName,
      }) satisfies TablesUpdate<"suppliers">;

      const { data, error } = await supabase
        .from("suppliers")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (!error) return data;

      logSupabaseError("suppliers.update.primary", error);

      if (!isMissingColumnError(error)) throw error;

      const legacyPayload = buildLegacySupplierUpdatePayload({
        ...input,
        name: normalizedName,
      });

      const { data: legacyData, error: legacyError } = await supabase
        .from("suppliers")
        .update(legacyPayload)
        .eq("id", id)
        .select()
        .single();

      if (!legacyError) {
        return legacyData;
      }

      logSupabaseError("suppliers.update.legacy", legacyError);

      if (!isMissingColumnError(legacyError, "admin_note")) {
        throw legacyError;
      }

      const { admin_note, ...legacyPayloadWithoutNote } = legacyPayload;
      const { data: legacyDataWithoutNote, error: legacyErrorWithoutNote } = await supabase
        .from("suppliers")
        .update(legacyPayloadWithoutNote)
        .eq("id", id)
        .select()
        .single();

      if (legacyErrorWithoutNote) {
        logSupabaseError("suppliers.update.legacyWithoutNote", legacyErrorWithoutNote);
        throw legacyErrorWithoutNote;
      }

      return legacyDataWithoutNote;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", "details", variables.id] });
      toast.success("Fornecedor atualizado com sucesso!");
    },
    onError: (error) => {
      logSupabaseError("suppliers.update.onError", error);
      const message = getSupabaseErrorMessage(error);
      toast.error(`Erro ao atualizar fornecedor: ${message}`);
    },
  });
}

export function useAdminSuppliers() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ["admin", "suppliers"],
    enabled: isAdmin,
    retry: false,
    queryFn: async (): Promise<AdminSupplierListItem[]> => {
      const { data, error } = await supabase
        .from("suppliers")
        .select(
          "id, name, avatar_url, country, shipping_method, prep_time, shipping_time, whatsapp_link, group_link, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (!error) {
        return (data || []).map((supplier) => {
          const normalized = normalizeSupplier(supplier);
          return {
            ...normalized,
            status: normalizeSupplierStatus(supplier.status),
            created_at: supplier.created_at,
          } satisfies AdminSupplierListItem;
        });
      }

      logSupabaseError("suppliers.adminList.primary", error);

      if (!isMissingColumnError(error)) throw error;

      const { data: legacyData, error: legacyError } = await supabase
        .from("suppliers")
        .select("id, name, status, link, contact, admin_note, created_at")
        .order("created_at", { ascending: false });

      if (legacyError) {
        logSupabaseError("suppliers.adminList.legacy", legacyError);
        throw legacyError;
      }

      return (legacyData || []).map((supplier) =>
        mapLegacyAdminSupplier(supplier as LegacyAdminSupplierRow)
      );
    },
  });
}

export function useUpdateSupplierStatus() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => {
      if (!isAdmin) throw new Error("Apenas administradores podem alterar o status.");

      const { data, error } = await supabase
        .from("suppliers")
        .update({
          status,
          is_approved: status === "approved",
        } satisfies TablesUpdate<"suppliers">)
        .eq("id", id)
        .select()
        .single();

      if (!error) return data;

      logSupabaseError("suppliers.updateStatus.primary", error);

      if (!isMissingColumnError(error, "is_approved")) throw error;

      const { data: legacyData, error: legacyError } = await supabase
        .from("suppliers")
        .update({ status } satisfies TablesUpdate<"suppliers">)
        .eq("id", id)
        .select()
        .single();

      if (legacyError) {
        logSupabaseError("suppliers.updateStatus.legacy", legacyError);
        throw legacyError;
      }

      return legacyData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", "details", variables.id] });
      toast.success(
        variables.status === "approved"
          ? "Fornecedor aprovado com sucesso!"
          : "Fornecedor rejeitado com sucesso!"
      );
    },
    onError: (error) => {
      logSupabaseError("suppliers.updateStatus.onError", error);
      const message = getSupabaseErrorMessage(error);
      toast.error(`Erro ao atualizar status do fornecedor: ${message}`);
    },
  });
}
