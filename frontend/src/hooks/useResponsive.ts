import { useTheme, useMediaQuery, type Breakpoint } from '@mui/material';

/**
 * A senior-level hook for responsive logic.
 * Provides easy-to-use flags for common breakpoints.
 */
export const useResponsive = () => {
  const theme = useTheme();

  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
  const downMd = useMediaQuery(theme.breakpoints.down('md'));
  const downLg = useMediaQuery(theme.breakpoints.down('lg'));

  const upSm = useMediaQuery(theme.breakpoints.up('sm'));
  const upMd = useMediaQuery(theme.breakpoints.up('md'));
  const upLg = useMediaQuery(theme.breakpoints.up('lg'));

  const between = (start: Breakpoint, end: Breakpoint) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMediaQuery(theme.breakpoints.between(start, end));

  return {
    isXs, isSm, isMd, isLg, isXl,
    downSm, downMd, downLg,
    upSm, upMd, upLg,
    between,
    theme
  };
};

export default useResponsive;
