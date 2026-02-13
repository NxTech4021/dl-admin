import { useState, useEffect, useCallback } from 'react';
import { logger } from "@/lib/logger";

// ----------------------------------------------------------------------

export function useLocalStorage(key, initialState) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const restored = getStorage(key);

    if (restored) {
      setState((prevValue) => ({
        ...prevValue,
        ...restored,
      }));
    }
  }, [key]);

  const updateState = useCallback(
    (updateValue) => {
      setState((prevValue) => {
        setStorage(key, {
          ...prevValue,
          ...updateValue,
        });

        return {
          ...prevValue,
          ...updateValue,
        };
      });
    },
    [key]
  );

  const update = useCallback(
    (name, updateValue) => {
      updateState({
        [name]: updateValue,
      });
    },
    [updateState]
  );

  const reset = useCallback(() => {
    removeStorage(key);
    setState(initialState);
  }, [initialState, key]);

  return {
    state,
    update,
    reset,
  };
}

// ----------------------------------------------------------------------

export const getStorage = (key) => {
  let value = null;

  try {
    const result = window.localStorage.getItem(key);

    if (result) {
      value = JSON.parse(result);
    }
  } catch (error) {
    logger.error(error);
  }

  return value;
};

export const setStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error(error);
  }
};

export const removeStorage = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    logger.error(error);
  }
};
