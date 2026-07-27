import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

const hasMeaningfulData = (data) => {
  if (!data) return false;
  return Object.values(data).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') {
      return hasMeaningfulData(value);
    }
    return value !== '' && value !== null && value !== undefined;
  });
};

export function useFormDraft({
  draftKey,



  initialData,
  enabled = true,
  debounceMs = 400,
  version = 1,
  excludeFields = [],
  mergeDraft = (base, saved) => ({ ...base, ...saved }),
  validateDraft = () => true,
  erpUpdatedAt = null,
}) {
  const configRef = useRef({});
  configRef.current = { mergeDraft, validateDraft, excludeFields };

  const [formData, setFormData] = useState(initialData);
  const [restoreStatus, setRestoreStatus] = useState('CHECKING');
  const [draftSavedAt, setDraftSavedAt] = useState(null);

  const initialDataRef = useRef(initialData);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const sanitize = useCallback(
    (data) => {
      const copy = structuredClone(data);
      const fields = configRef.current.excludeFields || [];
      for (const field of fields) {
        delete copy[field];
      }
      return copy;
    },
    []
  );

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(draftKey);
    setDraftSavedAt(null);
  }, [draftKey]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setRestoreStatus('READY');
      return;
    }

    let cancelled = false;

    const resolveDraft = async () => {
      const rawDraft = localStorage.getItem(draftKey);

      if (!rawDraft) {
        setFormData(initialDataRef.current);
        if (!cancelled) setRestoreStatus('READY');
        return;
      }

      try {
        const storedDraft = JSON.parse(rawDraft);

        // Version check and basic validation
        if (
          storedDraft.version !== version ||
          !storedDraft.formData ||
          !configRef.current.validateDraft(storedDraft)
        ) {
          localStorage.removeItem(draftKey);
          setFormData(initialDataRef.current);
          if (!cancelled) setRestoreStatus('READY');
          return;
        }

        // Compare against canonical ERP record updatedAt timestamp
        if (erpUpdatedAt && storedDraft.savedAt) {
          const erpTime = new Date(erpUpdatedAt).getTime();
          const draftTime = new Date(storedDraft.savedAt).getTime();

          if (erpTime > draftTime) {
            // ERP business record is newer than browser draft; discard browser draft silently
            localStorage.removeItem(draftKey);
            setFormData(initialDataRef.current);
            if (!cancelled) setRestoreStatus('READY');
            return;
          }
        }

        const result = await Swal.fire({
          icon: 'question',
          title: 'Restore unsaved form?',
          text: storedDraft.savedAt
            ? `An unsaved draft was saved at ${new Date(storedDraft.savedAt).toLocaleString()}.`
            : 'An unsaved draft was found.',
          showCancelButton: true,
          confirmButtonText: 'Restore Draft',
          cancelButtonText: 'Discard Draft',
          allowOutsideClick: false,
          customClass: {
            popup: 'swal-premium-popup',
            title: 'swal-premium-title',
            confirmButton: 'swal-premium-confirm-btn',
            cancelButton: 'swal-premium-cancel-btn'
          }
        });

        if (cancelled) return;

        if (result.isConfirmed) {
          setFormData(configRef.current.mergeDraft(initialDataRef.current, storedDraft.formData));
          setDraftSavedAt(storedDraft.savedAt || null);

          // Warn if attachments are excluded
          const fields = configRef.current.excludeFields || [];
          if (fields.includes('attachments') || fields.includes('files')) {
            Swal.fire({
              icon: 'info',
              title: 'Attachments Excluded',
              text: 'Previously selected files must be uploaded again.',
              timer: 3000,
              showConfirmButton: false
            });
          }
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch {
        localStorage.removeItem(draftKey);
      } finally {
        if (!cancelled) setRestoreStatus('READY');
      }
    };

    resolveDraft();

    return () => {
      cancelled = true;
    };
  }, [draftKey, enabled, version, erpUpdatedAt]);

  useEffect(() => {
    if (
      !enabled ||
      restoreStatus !== 'READY' ||
      typeof window === 'undefined'
    ) {
      return;
    }

    if (!hasMeaningfulData(formData)) {
      return; // Do not save empty forms
    }

    const timeout = setTimeout(() => {
      const sanitizedData = sanitize(formData);

      localStorage.setItem(
        draftKey,
        JSON.stringify({
          version,
          formData: sanitizedData,
          savedAt: new Date().toISOString(),
        })
      );

      setDraftSavedAt(new Date().toISOString());
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [debounceMs, draftKey, enabled, formData, restoreStatus, sanitize, version]);

  return {
    formData,
    setFormData,
    clearDraft,
    restoreStatus,
    draftSavedAt,
  };
}
