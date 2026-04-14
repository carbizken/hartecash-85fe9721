
-- Platform products catalog
CREATE TABLE public.platform_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'box',
  base_url text NOT NULL DEFAULT '/',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Platform bundles (groups of products)
CREATE TABLE public.platform_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  monthly_price numeric NOT NULL DEFAULT 0,
  annual_price numeric,
  product_ids text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Dealer subscriptions
CREATE TABLE public.dealer_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id text NOT NULL DEFAULT 'default',
  bundle_id uuid REFERENCES public.platform_bundles(id),
  product_ids text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  trial_ends_at timestamptz,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  monthly_amount numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_subscriptions ENABLE ROW LEVEL SECURITY;

-- Products and bundles are readable by all (public catalog)
CREATE POLICY "Anyone can read products" ON public.platform_products FOR SELECT USING (true);
CREATE POLICY "Anyone can read bundles" ON public.platform_bundles FOR SELECT USING (true);

-- Dealer subscriptions readable by authenticated staff
CREATE POLICY "Staff can read own subscriptions" ON public.dealer_subscriptions
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- Seed the default Autocurb product
INSERT INTO public.platform_products (name, description, icon_name, base_url, sort_order)
VALUES ('Autocurb', 'Vehicle acquisition operating system', 'car', '/admin', 0);
