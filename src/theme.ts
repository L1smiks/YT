import { createTheme } from '@mui/material/styles';

/** MUI theme kept in sync with the CSS custom properties in styles/global.scss. */
export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#f1f1f1', contrastText: '#0f0f0f' },
        secondary: { main: '#ffb35c' },
        background: { default: '#0f0f0f', paper: '#1c1c1c' },
        text: { primary: '#f1f1f1', secondary: '#aaaaaa' },
        divider: 'rgba(255,255,255,0.1)',
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: "'Inter', 'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif",
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { borderRadius: 999, paddingInline: 16 } },
        },
        MuiIconButton: {
            styleOverrides: { root: { '&:focus-visible': { outline: '2px solid #f1f1f1' } } },
        },
        MuiDialog: {
            styleOverrides: { paper: { backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)' } },
        },
        MuiMenu: {
            styleOverrides: { paper: { backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)' } },
        },
        MuiTooltip: {
            styleOverrides: { tooltip: { backgroundColor: '#3a3a3a', fontSize: 12 } },
        },
        MuiSkeleton: {
            defaultProps: { animation: 'wave' },
            styleOverrides: { root: { backgroundColor: 'rgba(255,255,255,0.08)' } },
        },
    },
});
