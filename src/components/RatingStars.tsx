
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}

// BT8.5a: Component ngôi sao tái sử dụng
export function RatingStars({
  value,
  size = 18,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Text
            style={{
              fontSize: size,
              color:
                n <= Math.round(value)
                  ? colors.warning
                  : colors.line,
            }}
          >
            ★
          </Text>
        );

        // Có onChange: cho phép bấm chọn sao
        if (onChange) {
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              accessibilityRole="button"
              accessibilityLabel={`${n} sao`}
            >
              {star}
            </Pressable>
          );
        }

        // Không có onChange: chỉ hiển thị
        return <View key={n}>{star}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
