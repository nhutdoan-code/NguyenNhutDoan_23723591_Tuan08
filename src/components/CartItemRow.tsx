
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CartItem } from "../types";
import { colors, formatPrice, radius } from "../theme";
import { useDebounce } from "../hooks/useDebounce";

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

export function CartItemRow({
  item,
  onChangeQty,
  onRemove,
}: Props) {
  // BT8.6: State cục bộ
  const [qty, setQty] = useState(item.quantity);

  // Chờ 300ms sau khi ngừng bấm
  const debouncedQty = useDebounce(qty, 300);

  // Cập nhật Redux sau khi debounce
  useEffect(() => {
    if (debouncedQty !== item.quantity) {
      onChangeQty(item.bookId, debouncedQty);
    }
  }, [debouncedQty, item.quantity, item.bookId, onChangeQty]);

  // Đồng bộ khi số lượng từ Redux thay đổi
  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  // Giới hạn số lượng theo tồn kho
  const canDec = qty > 1;
  const canInc = qty < item.stock;

  return (
    <View style={styles.row}>
      {/* Ảnh bìa */}
      <View
        style={[
          styles.cover,
          { backgroundColor: item.color },
        ]}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      {/* Thông tin sách */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.price}>
          {formatPrice(item.price)}
        </Text>

        {/* BT8.6: Cụm nút giảm / tăng */}
        <View style={styles.quantityRow}>
          <Pressable
            disabled={!canDec}
            onPress={() =>
              setQty((q) => Math.max(1, q - 1))
            }
            accessibilityLabel="Giảm"
            style={[
              styles.qtyButton,
              !canDec && styles.disabled,
            ]}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </Pressable>

          <Text style={styles.qty}>{qty}</Text>

          <Pressable
            disabled={!canInc}
            onPress={() =>
              setQty((q) => Math.min(item.stock, q + 1))
            }
            accessibilityLabel="Tăng"
            style={[
              styles.qtyButton,
              !canInc && styles.disabled,
            ]}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
        </View>

        {/* Hiển thị tồn kho */}
        <Text style={styles.stock}>
          Còn {item.stock}
        </Text>
      </View>

      {/* Xóa sản phẩm: sẽ xử lý xác nhận ở BT8.7 */}
      <Pressable
        onPress={() => onRemove(item.bookId)}
        hitSlop={8}
        accessibilityLabel="Xóa khỏi giỏ"
      >
        <Text style={styles.trash}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 5,
    gap: 10,
  },
  cover: {
    width: 54,
    height: 72,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 26,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontWeight: "700",
    color: colors.text,
  },
  price: {
    color: colors.indigo,
    fontWeight: "800",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.navy,
  },
  qty: {
    minWidth: 20,
    textAlign: "center",
    fontWeight: "800",
    color: colors.navy,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.3,
  },
  stock: {
    color: colors.muted,
    fontSize: 12,
  },
  trash: {
    fontSize: 22,
  },
});
