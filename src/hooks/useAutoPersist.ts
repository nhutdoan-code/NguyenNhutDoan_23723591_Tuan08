
import { useEffect } from "react";
import { saveJSON } from "../storage/storage";

// BT8.7b: Hook tự động lưu dữ liệu
export function useAutoPersist<T>(
  key: string,
  value: T,
  ready: boolean
) {
  useEffect(() => {
    // Chỉ lưu sau khi đã khôi phục dữ liệu
    if (ready) {
      void saveJSON(key, value);
    }
  }, [key, value, ready]);
}
