import { useState, useCallback } from 'react';

/**
 * Hook for media file upload and validation
 * Platform-agnostic - works for both React Web and React Native
 */

export interface MediaFile {
  file: File | null;
  preview: string | null;
  type: 'image' | 'video' | null;
}

export interface MediaValidationRules {
  maxImageSize?: number; // in bytes
  maxVideoSize?: number; // in bytes
  allowedImageTypes?: string[];
  allowedVideoTypes?: string[];
}

export interface UseMediaUploadReturn {
  imageFile: MediaFile;
  videoFile: MediaFile;
  isValidating: boolean;
  setImageFile: (file: MediaFile) => void;
  setVideoFile: (file: MediaFile) => void;
  validateAndSetImage: (file: File) => Promise<boolean>;
  validateAndSetVideo: (file: File) => Promise<boolean>;
  clearImage: () => void;
  clearVideo: () => void;
  clearAll: () => void;
  hasMedia: boolean;
}

const DEFAULT_VALIDATION_RULES: MediaValidationRules = {
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
};

/**
 * Hook for managing media file uploads with validation
 */
export const useMediaUpload = (
  validationRules: MediaValidationRules = {},
  onError?: (message: string) => void
): UseMediaUploadReturn => {
  const [imageFile, setImageFile] = useState<MediaFile>({
    file: null,
    preview: null,
    type: null,
  });

  const [videoFile, setVideoFile] = useState<MediaFile>({
    file: null,
    preview: null,
    type: null,
  });

  const [isValidating, setIsValidating] = useState(false);

  const rules = { ...DEFAULT_VALIDATION_RULES, ...validationRules };

  const validateImageFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file type
      if (!rules.allowedImageTypes?.includes(file.type)) {
        return {
          valid: false,
          error: `Invalid image type. Allowed types: ${rules.allowedImageTypes?.join(', ')}`,
        };
      }

      // Check file size
      if (rules.maxImageSize && file.size > rules.maxImageSize) {
        const maxSizeMB = (rules.maxImageSize / (1024 * 1024)).toFixed(1);
        return {
          valid: false,
          error: `Image size must be less than ${maxSizeMB}MB`,
        };
      }

      return { valid: true };
    },
    [rules]
  );

  const validateVideoFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file type
      if (!rules.allowedVideoTypes?.includes(file.type)) {
        return {
          valid: false,
          error: `Invalid video type. Allowed types: ${rules.allowedVideoTypes?.join(', ')}`,
        };
      }

      // Check file size
      if (rules.maxVideoSize && file.size > rules.maxVideoSize) {
        const maxSizeMB = (rules.maxVideoSize / (1024 * 1024)).toFixed(1);
        return {
          valid: false,
          error: `Video size must be less than ${maxSizeMB}MB`,
        };
      }

      return { valid: true };
    },
    [rules]
  );

  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const validateAndSetImage = useCallback(
    async (file: File): Promise<boolean> => {
      setIsValidating(true);

      try {
        const validation = validateImageFile(file);

        if (!validation.valid) {
          if (onError && validation.error) {
            onError(validation.error);
          }
          return false;
        }

        const preview = await createPreview(file);

        setImageFile({
          file,
          preview,
          type: 'image',
        });

        return true;
      } catch (error) {
        console.error('Error validating image:', error);
        if (onError) {
          onError('Failed to process image file');
        }
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [validateImageFile, createPreview, onError]
  );

  const validateAndSetVideo = useCallback(
    async (file: File): Promise<boolean> => {
      setIsValidating(true);

      try {
        const validation = validateVideoFile(file);

        if (!validation.valid) {
          if (onError && validation.error) {
            onError(validation.error);
          }
          return false;
        }

        const preview = await createPreview(file);

        setVideoFile({
          file,
          preview,
          type: 'video',
        });

        return true;
      } catch (error) {
        console.error('Error validating video:', error);
        if (onError) {
          onError('Failed to process video file');
        }
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [validateVideoFile, createPreview, onError]
  );

  const clearImage = useCallback(() => {
    setImageFile({
      file: null,
      preview: null,
      type: null,
    });
  }, []);

  const clearVideo = useCallback(() => {
    setVideoFile({
      file: null,
      preview: null,
      type: null,
    });
  }, []);

  const clearAll = useCallback(() => {
    clearImage();
    clearVideo();
  }, [clearImage, clearVideo]);

  const hasMedia = imageFile.file !== null || videoFile.file !== null;

  return {
    imageFile,
    videoFile,
    isValidating,
    setImageFile,
    setVideoFile,
    validateAndSetImage,
    validateAndSetVideo,
    clearImage,
    clearVideo,
    clearAll,
    hasMedia,
  };
};
