
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { login } from "../services/authService";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../store/hooks";
import { validateEmail, validatePassword } from "../utils/validators";
import { RootScreenProps } from "../navigation/types";
import { colors } from "../theme";

export function LoginScreen({
  navigation,
  route,
}: RootScreenProps<"Login">) {
  const { signIn } = useAuth();

  // BT8.1: Khai báo state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    email?: string | null;
    password?: string | null;
  }>({});

  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // BT8.1: Xử lý đăng nhập
  const submit = async () => {
    setSubmitError("");

    // 1. Kiểm tra dữ liệu
    const e = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(e);

    if (e.email || e.password) return;

    // 2. Gọi API đăng nhập
    setLoading(true);

    try {
      const { user, token } = await login(email, password);

      // Lưu thông tin vào Redux store
      signIn(user, token);

      // 3. Điều hướng sau khi đăng nhập
      if (route.params?.redirectTo === "Checkout") {
        navigation.replace("Checkout", {
          total: route.params.total ?? 0,
        });
      } else {
        navigation.navigate("Tabs", {
          screen: "Home",
        });
      }
    } catch (err) {
      // 4. Hiển thị lỗi từ API
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>📚</Text>
        <Text style={styles.title}>Đăng nhập BookStore</Text>

        {/* Ô nhập Email */}
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          placeholder="Nhập email"
        />

        {/* Ô nhập Mật khẩu */}
        <FormField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          placeholder="Nhập mật khẩu"
        />

        {/* Lỗi đăng nhập từ API */}
        {submitError ? (
          <Text style={styles.submitError}>
            {submitError}
          </Text>
        ) : null}

        {/* Nút Đăng nhập */}
        <PrimaryButton
          title="Đăng nhập"
          onPress={submit}
          loading={loading}
        />

        {/* Chuyển sang Đăng ký */}
        <Pressable
          onPress={() =>
            navigation.replace("Register", route.params)
          }
        >
          <Text style={styles.link}>
            Chưa có tài khoản? Đăng ký
          </Text>
        </Pressable>

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Tài khoản demo: demo@bookstore.vn / 123456
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  logo: {
    fontSize: 56,
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
    marginBottom: 6,
  },
  submitError: {
    color: colors.danger,
    textAlign: "center",
  },
  link: {
    color: colors.indigo,
    fontWeight: "700",
    textAlign: "center",
  },
  hint: {
    backgroundColor: "#E0F2FE",
    padding: 10,
    borderRadius: 10,
  },
  hintText: {
    color: colors.navy,
    textAlign: "center",
    fontSize: 12,
  },
});
