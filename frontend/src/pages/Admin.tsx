import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminMe {
  authenticated: boolean;
}

const LINES = ["Trendy", "Glam", "Superjeans", "Basic", "Beachwear", "Mais Gata"];
const FLAGS = [
  { key: "novidade", label: "Novidade" },
  { key: "mais_vendida", label: "Mais vendida" },
  { key: "destaque", label: "Destaque" },
  { key: "trends", label: "Trends" },
  { key: "jeans", label: "Jeans" },
] as const;

interface FormState {
  name: string;
  category: string;
  line: string;
  price: string;
  old_price: string;
  reference: string;
  image: string;
  description: string;
  composition: string;
  novidade: boolean;
  mais_vendida: boolean;
  destaque: boolean;
  trends: boolean;
  jeans: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "vestidos",
  line: "Trendy",
  price: "",
  old_price: "",
  reference: "",
  image: "",
  description: "",
  composition: "",
  novidade: false,
  mais_vendida: false,
  destaque: false,
  trends: false,
  jeans: false,
};

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: (pwd: string) => apiPost<{ ok: boolean }>("/admin/login", { password: pwd }),
    onSuccess: () => {
      toast.success("Bem-vinda ao painel!");
      onSuccess();
    },
    onError: () => toast.error("Senha incorreta."),
  });

  return (
    <div className="mx-auto max-w-sm px-4 py-24" data-testid="admin-login-screen">
      <h1 className="text-center font-heading text-3xl">Painel Gatabakana</h1>
      <p className="mt-2 text-center text-xs text-stone-500">
        Acesso restrito à equipe da loja.
      </p>
      <form
        className="mt-8 border border-stone-200 bg-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!password) return toast.error("Informe a senha.");
          login.mutate(password);
        }}
      >
        <Label htmlFor="admin-password">Senha do administrador</Label>
        <Input
          id="admin-password"
          data-testid="admin-password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1.5"
        />
        <Button
          type="submit"
          data-testid="admin-login-button"
          className="mt-5 w-full"
          disabled={login.isPending}
        >
          {login.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: me, isLoading: loadingMe, refetch: refetchMe } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => apiGet<AdminMe>("/admin/me"),
    retry: false,
  });

  const authenticated = me?.authenticated === true;

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => apiGet<Product[]>("/admin/products"),
    enabled: authenticated,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<Category[]>("/catalog/categories"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const payloadFromForm = () => ({
    name: form.name.trim(),
    category: form.category,
    line: form.line,
    price: parseFloat(form.price),
    old_price: form.old_price ? parseFloat(form.old_price) : null,
    reference: form.reference.trim(),
    images: form.image.trim() ? [form.image.trim()] : [],
    colors: [{ name: "Único", hex: "#C9C2B6" }],
    sizes: [
      { size: "P", stock: 10 },
      { size: "M", stock: 10 },
      { size: "G", stock: 10 },
    ],
    description: form.description.trim(),
    composition: form.composition.trim(),
    novidade: form.novidade,
    mais_vendida: form.mais_vendida,
    destaque: form.destaque,
    trends: form.trends,
    jeans: form.jeans,
  });

  const createProduct = useMutation({
    mutationFn: () => apiPost<Product>("/admin/products", payloadFromForm()),
    onSuccess: (product) => {
      toast.success("Produto criado!", { description: product.name });
      setDialogOpen(false);
      invalidate();
    },
    onError: () => toast.error("Não foi possível criar o produto."),
  });

  const updateProduct = useMutation({
    mutationFn: (id: string) => apiPatch<Product>(`/admin/products/${id}`, payloadFromForm()),
    onSuccess: (product) => {
      toast.success("Produto atualizado!", { description: product.name });
      setDialogOpen(false);
      invalidate();
    },
    onError: () => toast.error("Não foi possível salvar as alterações."),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success("Produto removido.");
      invalidate();
    },
    onError: () => toast.error("Não foi possível remover o produto."),
  });

  const logout = useMutation({
    mutationFn: () => apiPost<{ ok: boolean }>("/admin/logout"),
    onSuccess: () => {
      queryClient.clear();
      refetchMe();
      toast.message("Sessão encerrada.");
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      line: product.line,
      price: String(product.price),
      old_price: product.old_price ? String(product.old_price) : "",
      reference: product.reference,
      image: product.images[0] ?? "",
      description: product.description,
      composition: product.composition,
      novidade: product.novidade,
      mais_vendida: product.mais_vendida,
      destaque: product.destaque,
      trends: product.trends,
      jeans: product.jeans,
    });
    setDialogOpen(true);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 3) return toast.error("Informe o nome do produto.");
    const price = parseFloat(form.price);
    if (!price || price <= 0) return toast.error("Informe um preço válido.");
    if (editing) updateProduct.mutate(editing.id);
    else createProduct.mutate();
  };

  if (loadingMe) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center" data-testid="admin-loading">
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-stone-200" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen onSuccess={() => refetchMe()} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" data-testid="admin-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl">
            Painel de Produtos
          </h1>
          <p className="mt-1 text-xs text-stone-500" data-testid="admin-product-count">
            {products ? `${products.length} produtos cadastrados` : "Carregando..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="admin-new-product-button" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Novo produto
          </Button>
          <Button variant="outline" data-testid="admin-logout-button" onClick={() => logout.mutate()}>
            <LogOut className="mr-1.5 h-4 w-4" /> Sair
          </Button>
        </div>
      </div>

      <div className="mt-8 border border-stone-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Linha</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Destaques</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-stone-500">
                  Carregando produtos...
                </TableCell>
              </TableRow>
            )}
            {(products ?? []).map((product) => (
              <TableRow key={product.id} data-testid={`admin-row-${product.slug}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <img src={product.images[0]} alt="" className="h-12 w-9 shrink-0 object-cover" />
                    )}
                    <span className="text-xs font-medium uppercase tracking-wide">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{product.category}</TableCell>
                <TableCell className="text-xs">{product.line}</TableCell>
                <TableCell className="text-xs">
                  <span className="font-semibold">{formatBRL(product.price)}</span>
                  {product.old_price && (
                    <span className="ml-1.5 text-stone-400 line-through">{formatBRL(product.old_price)}</span>
                  )}
                </TableCell>
                <TableCell className="text-[10px] uppercase tracking-wide text-stone-500">
                  {FLAGS.filter((f) => product[f.key]).map((f) => f.label).join(", ") || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      data-testid={`admin-edit-${product.slug}`}
                      aria-label={`Editar ${product.name}`}
                      onClick={() => openEdit(product)}
                      className="p-2 text-stone-500 transition-colors hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      data-testid={`admin-delete-${product.slug}`}
                      aria-label={`Remover ${product.name}`}
                      onClick={() => {
                        if (confirm(`Remover "${product.name}"?`)) deleteProduct.mutate(product.id);
                      }}
                      className="p-2 text-stone-400 transition-colors hover:text-brand"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogTitle className="font-heading text-2xl">
            {editing ? "Editar produto" : "Novo produto"}
          </DialogTitle>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submitForm}>
            <div className="sm:col-span-2">
              <Label htmlFor="product-name">Nome *</Label>
              <Input
                id="product-name"
                data-testid="admin-form-name-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VESTIDO LONGO ..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(value: string) => setForm({ ...form, category: value })}>
                <SelectTrigger data-testid="admin-form-category-select" className="mt-1.5 w-full">
                  <SelectValue>{form.category}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Linha</Label>
              <Select value={form.line} onValueChange={(value: string) => setForm({ ...form, line: value })}>
                <SelectTrigger data-testid="admin-form-line-select" className="mt-1.5 w-full">
                  <SelectValue>{form.line}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LINES.map((line) => (
                    <SelectItem key={line} value={line}>
                      {line}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product-price">Preço de venda (R$) *</Label>
              <Input
                id="product-price"
                data-testid="admin-form-price-input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })}
                placeholder="299.90"
                inputMode="decimal"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="product-old-price">Preço original (R$)</Label>
              <Input
                id="product-old-price"
                data-testid="admin-form-old-price-input"
                value={form.old_price}
                onChange={(e) => setForm({ ...form, old_price: e.target.value.replace(/[^\d.]/g, "") })}
                placeholder="499.90 (para mostrar desconto)"
                inputMode="decimal"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="product-reference">Referência</Label>
              <Input
                id="product-reference"
                data-testid="admin-form-reference-input"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="41520-101"
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="product-image">URL da imagem</Label>
              <Input
                id="product-image"
                data-testid="admin-form-image-input"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="product-description">Descrição</Label>
              <Textarea
                id="product-description"
                data-testid="admin-form-description-input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="product-composition">Composição</Label>
              <Input
                id="product-composition"
                data-testid="admin-form-composition-input"
                value={form.composition}
                onChange={(e) => setForm({ ...form, composition: e.target.value })}
                placeholder="100% viscose"
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Vitrines da home</Label>
              <div className="mt-2 flex flex-wrap gap-4">
                {FLAGS.map((flag) => (
                  <label key={flag.key} className="flex items-center gap-2 text-xs">
                    <Checkbox
                      data-testid={`admin-form-flag-${flag.key}`}
                      checked={form[flag.key]}
                      onCheckedChange={(checked: boolean) => setForm({ ...form, [flag.key]: checked })}
                    />
                    {flag.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-2 flex gap-2 sm:col-span-2">
              <Button
                type="submit"
                data-testid="admin-form-submit-button"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="flex-1"
              >
                {createProduct.isPending || updateProduct.isPending
                  ? "Salvando..."
                  : editing
                    ? "Salvar alterações"
                    : "Criar produto"}
              </Button>
              <Button
                type="button"
                variant="outline"
                data-testid="admin-form-cancel-button"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
