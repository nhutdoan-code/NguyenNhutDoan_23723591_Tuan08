
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { colors } from "../theme";
import { useWishlist } from "../store/hooks";

interface Props {
  bookId: number;
  size?: number;
  style?: ViewStyle;
}

// BT8.8a: Nút yêu thích dùng chung Redux wishlist
export function HeartButton({
  bookId,
  size = 34,
  style,
}: Props) {
  // Lấy hàm kiểm tra và thay đổi trạng thái yêu thích
  const { isFavorite, toggle } = useWishlist();

  // Kiểm tra sách hiện tại có được yêu thích không
  const fav = isFavorite(bookId);

  return (
    <Pressable
      onPress={() => toggle(bookId)}
      accessibilityRole="button"
      accessibilityLabel={
        fav ? "Bỏ yêu thích" : "Yêu thích"
      }
      style={[
        styles.btn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: size * 0.55,
          color: fav ? colors.heart : colors.muted,
        }}
      >
        {fav ? "♥" : "♡"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});
