import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Favorites from "@/pages/Favorites";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import { CartProvider } from "@/lib/cart";
import { FavoritesProvider } from "@/lib/favorites";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <FavoritesProvider>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/produtos" element={<Catalog />} />
            <Route path="/categoria/:slug" element={<Catalog />} />
            <Route path="/novidades" element={<Catalog />} />
            <Route path="/outlet" element={<Catalog />} />
            <Route path="/busca" element={<Catalog />} />
            <Route path="/produto/:slug" element={<ProductDetail />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido/:id" element={<OrderSuccess />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CartProvider>
    </FavoritesProvider>
  );
}
