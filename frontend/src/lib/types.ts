// Hand-written mirrors of the backend Pydantic models — keep both in sync in the same edit.

export interface ColorVariant {
  name: string;
  hex: string;
}

export interface SizeStock {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  reference: string;
  category: string;
  line: string;
  price: number;
  old_price: number | null;
  images: string[];
  colors: ColorVariant[];
  sizes: SizeStock[];
  description: string;
  composition: string;
  novidade: boolean;
  mais_vendida: boolean;
  destaque: boolean;
  trends: boolean;
  jeans: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  order: number;
}

export interface OrderItem {
  product_id: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  image: string;
  price: number;
  quantity: number;
  line_total: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export interface CreditCardInfo {
  holder: string;
  last4: string;
  installments: number;
}

export interface Order {
  id: string;
  number: string;
  items: OrderItem[];
  customer: OrderCustomer;
  payment_method: "pix" | "credit_card";
  coupon_code: string | null;
  credit_card: CreditCardInfo | null;
  subtotal: number;
  coupon_discount: number;
  pix_discount: number;
  shipping: number;
  total: number;
  status: string;
  estimated_delivery: string;
  created_at: string;
}

export interface CouponValidation {
  valid: boolean;
  discount_pct: number;
  message: string;
}

export interface NewsletterResponse {
  email: string;
  message: string;
}
