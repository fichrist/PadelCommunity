import { useState, useCallback } from 'react';

/**
 * Generic form state management hook
 * Platform-agnostic - works for both React Web and React Native
 */

export interface UseFormStateReturn<T> {
  formData: T;
  isDirty: boolean;
  setFormData: (data: T) => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  updateFields: (updates: Partial<T>) => void;
  resetForm: (data?: T) => void;
  isFieldDirty: (field: keyof T) => boolean;
}

/**
 * Hook for managing form state with dirty tracking
 */
export const useFormState = <T extends Record<string, any>>(
  initialData: T
): UseFormStateReturn<T> => {
  const [formData, setFormData] = useState<T>(initialData);
  const [initialFormData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);

  const checkIfDirty = useCallback(
    (newData: T): boolean => {
      return JSON.stringify(newData) !== JSON.stringify(initialFormData);
    },
    [initialFormData]
  );

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value };
        setIsDirty(checkIfDirty(newData));
        return newData;
      });
    },
    [checkIfDirty]
  );

  const updateFields = useCallback(
    (updates: Partial<T>) => {
      setFormData((prev) => {
        const newData = { ...prev, ...updates };
        setIsDirty(checkIfDirty(newData));
        return newData;
      });
    },
    [checkIfDirty]
  );

  const resetForm = useCallback((data?: T) => {
    const resetData = data || initialFormData;
    setFormData(resetData);
    setIsDirty(false);
  }, [initialFormData]);

  const isFieldDirty = useCallback(
    (field: keyof T): boolean => {
      return formData[field] !== initialFormData[field];
    },
    [formData, initialFormData]
  );

  return {
    formData,
    isDirty,
    setFormData,
    updateField,
    updateFields,
    resetForm,
    isFieldDirty,
  };
};

/**
 * Hook for managing array-based selections (tags, filters, etc.)
 */
export interface UseArraySelectionReturn<T> {
  selected: T[];
  isSelected: (item: T) => boolean;
  toggle: (item: T) => void;
  add: (item: T) => void;
  remove: (item: T) => void;
  clear: () => void;
  set: (items: T[]) => void;
  count: number;
}

export const useArraySelection = <T>(
  initialSelection: T[] = []
): UseArraySelectionReturn<T> => {
  const [selected, setSelected] = useState<T[]>(initialSelection);

  const isSelected = useCallback(
    (item: T): boolean => {
      return selected.includes(item);
    },
    [selected]
  );

  const toggle = useCallback((item: T) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }, []);

  const add = useCallback((item: T) => {
    setSelected((prev) => (prev.includes(item) ? prev : [...prev, item]));
  }, []);

  const remove = useCallback((item: T) => {
    setSelected((prev) => prev.filter((i) => i !== item));
  }, []);

  const clear = useCallback(() => {
    setSelected([]);
  }, []);

  const set = useCallback((items: T[]) => {
    setSelected(items);
  }, []);

  return {
    selected,
    isSelected,
    toggle,
    add,
    remove,
    clear,
    set,
    count: selected.length,
  };
};
