import { createTheme, ThemeOptions } from '@mui/material/styles';

// Tableau brand colors
const tableauColors = {
    primary: {
        main: '#1f77b4', // Tableau blue
        light: '#5aa3d1',
        dark: '#0d4f79',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#ff7f0e', // Tableau orange
        light: '#ffaa5a',
        dark: '#cc5500',
        contrastText: '#ffffff',
    },
    background: {
        default: '#f8f9fa', // Light background
        paper: '#ffffff',
        dark: '#003366', // Dark blue for forms
    },
    text: {
        primary: '#333333',
        secondary: '#666666',
        disabled: '#999999',
    },
    // Tableau-specific field colors
    field: {
        background: '#8cb3d9', // Light blue for editable fields
        hover: '#7ba5ce',
        focus: '#6a97c3',
        disabled: '#e6e6e6',
    },
    status: {
        stale: '#ff6b6b', // Red for stale data
        fresh: '#51cf66', // Green for fresh data
        warning: '#ffd43b', // Yellow for warnings
    },
    // Tableau's dimension/measure colors
    dimension: '#1f77b4',
    measure: '#ff7f0e',
    calculated: '#2ca02c',
};

const tableauTheme: ThemeOptions = {
    palette: {
        primary: tableauColors.primary,
        secondary: tableauColors.secondary,
        background: {
            default: tableauColors.background.default,
            paper: tableauColors.background.paper,
        },
        text: tableauColors.text,
        error: {
            main: '#d32f2f',
            light: '#ef5350',
            dark: '#c62828',
        },
        warning: {
            main: tableauColors.status.warning,
            light: '#fff176',
            dark: '#f57f17',
        },
        success: {
            main: tableauColors.status.fresh,
            light: '#81c784',
            dark: '#388e3c',
        },
    },
    typography: {
        fontFamily: [
            'Benton Sans',
            'Helvetica Neue',
            'Helvetica',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontSize: '1.5rem',
            fontWeight: 500,
            lineHeight: 1.2,
            '@media (max-width:600px)': {
                fontSize: '1.25rem',
            },
        },
        h2: {
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.3,
            '@media (max-width:600px)': {
                fontSize: '1.125rem',
            },
        },
        h3: {
            fontSize: '1.125rem',
            fontWeight: 500,
            lineHeight: 1.4,
            '@media (max-width:600px)': {
                fontSize: '1rem',
            },
        },
        h4: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.4,
            '@media (max-width:600px)': {
                fontSize: '0.875rem',
            },
        },
        h5: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        h6: {
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '0.75rem',
            lineHeight: 1.5,
        },
        body2: {
            fontSize: '0.6875rem',
            lineHeight: 1.4,
        },
        button: {
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'none' as const,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    padding: '6px 12px',
                    minHeight: 28,
                    fontSize: '0.75rem',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    },
                },
                contained: {
                    backgroundColor: tableauColors.primary.main,
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: tableauColors.primary.dark,
                    },
                    '&:disabled': {
                        backgroundColor: tableauColors.field.disabled,
                        color: '#999999',
                    },
                },
                outlined: {
                    borderColor: tableauColors.primary.main,
                    color: tableauColors.primary.main,
                    '&:hover': {
                        borderColor: tableauColors.primary.dark,
                        backgroundColor: 'rgba(31, 119, 180, 0.04)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: tableauColors.field.background,
                        borderRadius: 4,
                        '& fieldset': {
                            borderColor: '#d1d5db',
                        },
                        '&:hover fieldset': {
                            borderColor: tableauColors.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: tableauColors.primary.main,
                            borderWidth: 2,
                        },
                        '&.Mui-disabled': {
                            backgroundColor: tableauColors.field.disabled,
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#374151',
                        fontSize: '0.875rem',
                        '&.Mui-focused': {
                            color: tableauColors.primary.main,
                        },
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    backgroundColor: tableauColors.field.background,
                    borderRadius: 4,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: tableauColors.primary.main,
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    marginBottom: '1rem',
                    '& .MuiInputBase-root': {
                        height: '40px', // Standard height for better label positioning
                        fontSize: '0.875rem',
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '0.875rem',
                        transform: 'translate(14px, 10px) scale(1)', // Proper vertical centering
                        '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)', // Better shrunk position
                        },
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    lineHeight: 1,
                    '&.Mui-focused': {
                        color: tableauColors.primary.main,
                    },
                    '&.MuiInputLabel-shrink': {
                        lineHeight: 1.2,
                    },
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: tableauColors.primary.main,
                    '&.Mui-checked': {
                        color: tableauColors.primary.main,
                    },
                },
            },
        },
        MuiFormControlLabel: {
            styleOverrides: {
                label: {
                    fontSize: '0.875rem',
                    color: '#374151',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    borderRadius: 6,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
};

// Custom theme creator with Tableau colors
export const createTableauTheme = () => createTheme(tableauTheme);

// Export colors for use in components
export { tableauColors };

// Type augmentation for custom colors
declare module '@mui/material/styles' {
    interface Palette {
        field: {
            background: string;
            hover: string;
            focus: string;
            disabled: string;
        };
        status: {
            stale: string;
            fresh: string;
            warning: string;
        };
    }

    interface PaletteOptions {
        field?: {
            background?: string;
            hover?: string;
            focus?: string;
            disabled?: string;
        };
        status?: {
            stale?: string;
            fresh?: string;
            warning?: string;
        };
    }
}