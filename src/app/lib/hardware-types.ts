export interface PricedHardwareItem {
  id: number;
  name: string;
  slug: string | null;
  category: string;

  description?: string | null;
  specs?: Record<string, any> | null;

  price?: number | null;

  current_price: number | null;
  current_price_source: string | null;
  price_checked_at: string | null;
  has_valid_price: boolean;
}
