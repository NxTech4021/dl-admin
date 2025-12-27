import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

interface UseCollapseNavReturn {
  openMobile: boolean;
  collapseDesktop: boolean;
  onOpenMobile: () => void;
  onCloseMobile: () => void;
  onCloseDesktop: () => void;
  onCollapseDesktop: () => void;
}

export default function useCollapseNav(): UseCollapseNavReturn {
  const [openMobile, setOpenMobile] = useState(false);

  const [collapseDesktop, setCollapseDesktop] = useState(false);

  const onCollapseDesktop = useCallback(() => {
    setCollapseDesktop((prev) => !prev);
  }, []);

  const onCloseDesktop = useCallback(() => {
    setCollapseDesktop(false);
  }, []);

  const onOpenMobile = useCallback(() => {
    setOpenMobile(true);
  }, []);

  const onCloseMobile = useCallback(() => {
    setOpenMobile(false);
  }, []);

  return {
    openMobile,
    collapseDesktop,
    onOpenMobile,
    onCloseMobile,
    onCloseDesktop,
    onCollapseDesktop,
  };
}
