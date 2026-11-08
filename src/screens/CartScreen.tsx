import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { TodoBox } from "../components/TodoBox";
import { Header } from "../components/Header";
import { CartItemRow } from "../components/CartItemRow";
import { PrimaryButton } from "../components/PrimaryButton";

import { EmptyState } from "../components/EmptyState";
import { useCart, useAuth } from "../store/hooks";
import { confirmDialog } from "../utils/dialog"; // đã viết sẵn — dùng ở BT8.7a
import { TabScreenProps } from "../navigation/types";
import { colors, formatPrice } from "../theme";


const COUPONS: Record<
  string,
  {
    label: string;
    discount: (subtotal: number) => number;
  }
> = {
  SALE10: {
    label: "Giảm 10%",
    discount: (subtotal) =>
      Math.round(subtotal * 0.1),
  },

  GIAM50K: {
    label: "Giảm 50.000đ",
    discount: (subtotal) =>
      Math.min(50000, subtotal),
  },
};


export function CartScreen({ navigation }: TabScreenProps<"Cart">) {
  const { items, totalPrice, setQty, remove } = useCart();
  const { isLoggedIn } = useAuth();

  // BT8.C2: State mã giảm giá
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  // Tính số tiền được giảm
  const discount = coupon
    ? COUPONS[coupon].discount(totalPrice)
    : 0;

  // Tổng tiền sau giảm
  const finalTotal = Math.max(0, totalPrice - discount);

  // Xử lý khi nhấn Áp dụng
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();

    if (COUPONS[code]) {
      setCoupon(code);
      setCouponMsg(
        `Đã áp dụng ${code}: ${COUPONS[code].label}`
      );
    } else {
      setCoupon(null);
      setCouponMsg("Mã giảm giá không hợp lệ");
    }
  };

  // TODO BT8.7a: xóa sản phẩm có XÁC NHẬN — dùng confirmDialog(title, message, onConfirm) đã viết sẵn ở utils/dialog.ts
  //   (Alert.alert không chạy trên web nên đã bọc sẵn). Hiện tại xóa ngay không hỏi.
  // BT8.7a: Xác nhận trước khi xóa
  const askRemove = (bookId: number) => {
    const item = items.find((i) => i.bookId === bookId);

    confirmDialog(
      "Xóa sản phẩm",
      `Xóa "${item?.title ?? "sản phẩm"}" khỏi giỏ hàng?`,
      () => remove(bookId)
    );
  };

  // TODO BT8.4: bảo vệ Checkout — nếu isLoggedIn → navigate("Checkout", { total: finalTotal })
  //   chưa đăng nhập → navigate("Login", { redirectTo: "Checkout", total: finalTotal })
  // BT8.4: Kiểm tra đăng nhập trước khi thanh toán
  const goCheckout = () => {
    if (isLoggedIn) {
      // Đã đăng nhập: vào thẳng Checkout
      navigation.navigate("Checkout", {
        total: finalTotal,
      });
    } else {
      // Chưa đăng nhập: chuyển sang Login
      navigation.navigate("Login", {
        redirectTo: "Checkout",
        total: finalTotal,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="🛒 Giỏ hàng" />
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.bookId)}
        renderItem={({ item }) => <CartItemRow item={item} onChangeQty={setQty} onRemove={askRemove} />}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState emoji="🛒" title="Giỏ hàng trống" message="Hãy chọn vài cuốn sách yêu thích nhé." actionLabel="Khám phá sách" onAction={() => navigation.navigate("Home")} />
        }
      />
      {items.length > 0 && (
        <View style={styles.footer}>

          {/* BT8.C2: Nhập mã giảm giá */}
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Nhập mã giảm giá"
              value={couponInput}
              onChangeText={setCouponInput}
              autoCapitalize="characters"
            />

            <View style={styles.couponButton}>
              <PrimaryButton
                title="Áp dụng"
                onPress={applyCoupon}
              />
            </View>
          </View>

          {/* Thông báo kết quả áp dụng */}
          {couponMsg !== "" && (
            <Text
              style={{
                color: coupon ? colors.indigo : colors.danger,
              }}
            >
              {couponMsg}
            </Text>
          )}
          <View style={styles.line}><Text style={styles.muted}>Tạm tính</Text><Text style={styles.value}>{formatPrice(totalPrice)}</Text></View>

          {discount > 0 && (
            <View style={styles.line}>
              <Text style={styles.muted}>Giảm giá</Text>
              <Text style={styles.discount}>
                -{formatPrice(discount)}
              </Text>
            </View>
          )}

          <View style={styles.line}><Text style={styles.total}>Tổng cộng</Text><Text style={styles.total}>{formatPrice(finalTotal)}</Text></View>
          <PrimaryButton title="Thanh toán" onPress={goCheckout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  footer: { backgroundColor: "#fff", padding: 14, gap: 8, borderTopWidth: 1, borderTopColor: colors.line },
  line: { flexDirection: "row", justifyContent: "space-between" },
  muted: { color: colors.muted },
  value: { fontWeight: "700", color: colors.text },
  total: { fontSize: 17, fontWeight: "800", color: colors.navy },
  
couponRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

couponInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: colors.line,
  borderRadius: 8,
  paddingHorizontal: 12,
  height: 44,
  color: colors.text,
  backgroundColor: "#fff",
},

couponButton: {
  minWidth: 110,
},

discount: {
  fontWeight: "700",
  color: colors.indigo,
},

});
