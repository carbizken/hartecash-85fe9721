import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

// ── Types ──

export interface PlatformProduct {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  base_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface PlatformBundle {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number | null;
  product_ids: string[];
  is_featured: boolean;
  sort_order: number;
}

export interface DealerSubscription {
  id: string;
  bundle_id: string | null;
  product_ids: string[];
  status: string;
  trial_ends_at: string | null;
  billing_cycle: string;
  monthly_amount: number | null;
}

interface PlatformContextValue {
  products: PlatformProduct[];
  bundles: PlatformBundle[];
  activeProducts: string[];
  currentProduct: string;
  hasProduct: (productId: string) => boolean;
  subscription: DealerSubscription | null;
  loading: boolean;
}

const PlatformContext = createContext<PlatformContextValue>({
  products: [],
  bundles: [],
  activeProducts: [],
  currentProduct: "autocurb",
  hasProduct: () => false,
  subscription: null,
  loading: true,
});

export const usePlatform = () => useContext(PlatformContext);

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const { tenant } = useTenant();
  const [products, setProducts] = useState<PlatformProduct[]>([]);
  const [bundles, setBundles] = useState<PlatformBundle[]>([]);
  const [subscription, setSubscription] = useState<DealerSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchPlatformData = async () => {
      try {
        // Fetch products and bundles in parallel
        const [productsRes, bundlesRes, subRes] = await Promise.all([
          supabase
            .from("platform_products")
            .select("id, name, description, icon_name, base_url, is_active, sort_order")
            .order("sort_order"),
          supabase
            .from("platform_bundles")
            .select("id, name, description, monthly_price, annual_price, product_ids, is_featured, sort_order")
            .order("sort_order"),
          supabase
            .from("dealer_subscriptions")
            .select("id, bundle_id, product_ids, status, trial_ends_at, billing_cycle, monthly_amount")
            .eq("dealership_id", tenant.dealership_id)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        if (productsRes.data) {
          setProducts(productsRes.data as PlatformProduct[]);
        }
        if (bundlesRes.data) {
          setBundles(bundlesRes.data as PlatformBundle[]);
        }
        if (subRes.data) {
          setSubscription(subRes.data as DealerSubscription);
        }
      } catch (err) {
        console.error("Failed to fetch platform data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlatformData();
    return () => { cancelled = true; };
  }, [tenant.dealership_id]);

  const activeProducts = subscription?.product_ids ?? [];

  const hasProduct = useCallback(
    (productId: string) => activeProducts.includes(productId),
    [activeProducts],
  );

  return (
    <PlatformContext.Provider
      value={{
        products,
        bundles,
        activeProducts,
        currentProduct: "autocurb",
        hasProduct,
        subscription,
        loading,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};
