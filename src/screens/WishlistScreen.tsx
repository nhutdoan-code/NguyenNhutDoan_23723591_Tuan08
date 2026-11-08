
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";

import { BookGrid } from "../components/BookGrid";
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";

import { getBooks } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useWishlist } from "../store/hooks";
import { RootScreenProps } from "../navigation/types";
import { Book } from "../types";
import { colors } from "../theme";

// BT8.8b: Màn danh sách sách yêu thích
export function WishlistScreen({
  navigation,
}: RootScreenProps<"Wishlist">) {
  // Lấy danh sách ID yêu thích từ Redux
  const { ids } = useWishlist();

  // State lưu dữ liệu sách
  const [books, setBooks] = useState<Book[]>([]);

  // State xử lý loading và lỗi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Lấy danh sách sách từ API
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getBooks();
      setBooks(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Gọi API khi mở màn hình
  useEffect(() => {
    void load();
  }, [load]);

  // 3. Lọc những sách có ID nằm trong wishlist
  const favorites = useMemo(() => {
    return books.filter((book) =>
      ids.includes(book.id)
    );
  }, [books, ids]);

  // 4. Hiển thị trạng thái đang tải
  if (loading) {
    return <LoadingView />;
  }

  // 5. Hiển thị lỗi và nút Thử lại
  if (error) {
    return (
      <ErrorView
        message={error}
        onRetry={load}
      />
    );
  }

  // 6. Hiển thị danh sách yêu thích
  return (
    <View style={styles.container}>
      <BookGrid
        data={favorites}
        onPressBook={(book) =>
          navigation.navigate("BookDetail", {
            bookId: book.id,
          })
        }
        ListEmptyComponent={
          <EmptyState
            emoji="💔"
            title="Chưa có sách yêu thích"
            message="Nhấn ♡ trên mỗi cuốn sách để lưu lại ở đây."
            actionLabel="Khám phá sách"
            onAction={() =>
              navigation.navigate("Tabs", {
                screen: "Home",
              })
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },
});
