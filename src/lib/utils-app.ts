export function formatMoney(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(v);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function finalPrice(price: number | string, discount: number | string | null | undefined) {
  const p = Number(price);
  const d = discount == null || discount === "" ? null : Number(discount);
  return d != null && d < p ? d : p;
}

export function discountPercent(
  price: number | string,
  discount: number | string | null | undefined,
) {
  const p = Number(price);
  const d = discount == null || discount === "" ? null : Number(discount);
  if (!d || d >= p) return 0;
  return Math.round(((p - d) / p) * 100);
}
