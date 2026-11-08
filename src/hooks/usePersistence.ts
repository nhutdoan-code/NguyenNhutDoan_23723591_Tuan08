
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { hydrateCart } from "../store/cartSlice";
import { hydrateWishlist } from "../store/wishlistSlice";
import {
  clearAuth,
  loadAuth,
  saveAuth,
} from "../storage/authStorage";
import { loadJSON } from "../storage/storage";
import { useAutoPersist } from "./useAutoPersist";
import { CartItem } from "../types";

export const CART_KEY = "@bookstore/cart";
export const WISHLIST_KEY = "@bookstore/wishlist";

export function usePersistence() {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  // Thông tin đăng nhập
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);

  // Dữ liệu giỏ hàng và yêu thích
  const cartItems = useAppSelector((s) => s.cart.items);
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);

  // BT8.3 + BT8.7b: Khôi phục dữ liệu
  useEffect(() => {
    (async () => {
      try {
        // Đọc đồng thời 3 loại dữ liệu
        const [auth, cart, wish] = await Promise.all([
          loadAuth(),
          loadJSON<CartItem[]>(CART_KEY),
          loadJSON<number[]>(WISHLIST_KEY),
        ]);

        // Khôi phục đăng nhập
        if (auth?.user && auth?.token) {
          dispatch(setCredentials(auth));
        }

        // Khôi phục giỏ hàng
        if (cart) {
          dispatch(hydrateCart(cart));
        }

        // Khôi phục danh sách yêu thích
        if (wish) {
          dispatch(hydrateWishlist(wish));
        }
      } catch (error) {
        console.error("Lỗi khôi phục dữ liệu:", error);
      } finally {
        // Cho phép ứng dụng hiển thị
        setReady(true);
      }
    })();
  }, [dispatch]);

  // BT8.3: Tự động lưu/xóa phiên đăng nhập
  useEffect(() => {
    if (!ready) return;

    if (user && token) {
      void saveAuth({ user, token });
    } else {
      void clearAuth();
    }
  }, [ready, user, token]);

  // BT8.7b: Tự động lưu giỏ hàng
  useAutoPersist(CART_KEY, cartItems, ready);

  // BT8.7b: Tự động lưu yêu thích
  useAutoPersist(WISHLIST_KEY, wishlistIds, ready);

  return ready;
}
