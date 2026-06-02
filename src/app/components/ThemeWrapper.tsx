import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lmsTheme } from '../theme';

// Uses React.createElement (not JSX) for ThemeProvider so Figma Make's JSX transform
// doesn't inject data-fg-* inspector props into it, avoiding MUI's PropTypes warning.
export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(
    ThemeProvider,
    { theme: lmsTheme },
    React.createElement(CssBaseline, null),
    children
  );
}
