import { useCallback, useEffect, useRef } from "react";

type UseLongPressOptions<T> = {
  enabled?: boolean;
  delay?: number;
  onLongPress: (payload: T) => void;
};

export function useLongPress<T>({
  enabled = true,
  delay = 500,
  onLongPress,
}: UseLongPressOptions<T>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const payloadRef = useRef<T | null>(null);
  const didLongPressRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback(
    (payload: T) => {
      if (!enabled) return;

      didLongPressRef.current = false;
      payloadRef.current = null;
      clearTimer();

      timerRef.current = setTimeout(() => {
        didLongPressRef.current = true;
        payloadRef.current = payload;
        onLongPress(payload);
      }, delay);
    },
    [clearTimer, delay, enabled, onLongPress]
  );

  const onTouchEnd = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const onTouchMove = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const consumeLongPressPayload = useCallback((): T | null => {
    if (!didLongPressRef.current) {
      return null;
    }

    didLongPressRef.current = false;
    const payload = payloadRef.current;
    payloadRef.current = null;
    return payload;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  return {
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    consumeLongPressPayload,
  };
}
