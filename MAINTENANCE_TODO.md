# Maintenance Tasks - CalReact

## Q2 2026 (March 2026)

### FormModal System Review
- [ ] **Review FormModal system for removal**
  - **Location**: `src/components/ui/modal/` (9 archivos)
  - **Hook**: `src/hooks/useModalManager.ts`
  - **Component**: `src/components/modals/projects/NewProjectDialogV2.tsx`
  - **Tests**: `src/components/ui/modal/__tests__/Modal.test.tsx`
  - **Decision date**: 2025-09-22 (revert from commit 299d80c)
  - **Reason**: Strategic preference for ModalLayout simplicity over FormModal architecture
  - **Status**: Currently deprecated, no active usage
  - **Action required**: Evaluate if system has been used in 6 months, if not → remove

### Verification Commands
```bash
# Before removal, verify no new active usage:
rg "import.*FormModal|useModalState|ConfirmationModal|InfoModal" src/ \
  --glob "!src/components/ui/modal/**" \
  --glob "!src/components/ui/index.ts" \
  --glob "!src/components/modals/projects/NewProjectDialogV2.tsx" \
  --glob "!src/hooks/useModalManager.ts"

# If output is empty, safe to remove deprecated system
```

### Files to Remove (if decision is made):
```bash
rm -rf src/components/ui/modal/
rm src/hooks/useModalManager.ts
rm src/components/modals/projects/NewProjectDialogV2.tsx
# Update src/components/ui/index.ts to remove FormModal exports
```

---

## Notes
- **Current active system**: ModalLayout (`src/components/modals/modalLayout.tsx`)
- **Deprecated system size**: ~1,200 líneas, 80K disco
- **Original migration rationale**: Elimination of button duplication between modals and forms
- **Revert rationale**: Preference for simplicity over architectural complexity