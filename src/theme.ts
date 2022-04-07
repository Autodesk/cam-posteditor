import {
    createTheme, ThemeOptions, Theme,
} from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// Module augmentation - extends some types without having to
// explicitly use `extends` and different type names elsewhere
// in the app (e.g. in `styled()`).
declare module '@mui/material/styles' {
    interface Palette {
        /** Colours used for colouring the list items. */
        selection: {
            hover: string,
            focus: string,
            selected: string,
            highlighted: string,
            highlightedText: string,
        },
        titleGrid: {
            background: string,
            gridBorder: string,
            contentBorder: string,
        },
        scrollbar: {
            track: string,
            thumb: string,
            active: string
        },
        monacoTheme: string,
        splitterColor: string,
    }

    // Need to override options, as well, because ThemeOptions
    // uses it
    interface PaletteOptions {
        listBackground?: string,
        selection: {
            hover: string,
            focus: string,
            selected: string,
            highlighted: string,
            highlightedText?: string,
        },
        titleGrid: {
            background: string,
            gridBorder: string,
            contentBorder: string,
        },
        scrollbar?: {
            track: string,
            thumb: string,
            active: string
        },
        monacoTheme: string,
        splitterColor: string,
    }
}

// HIG Storybook: Light gray colour scheme
const higLight: ThemeOptions = {
    palette: {
        mode: 'light',
        text: {
            primary: '#3c3c3c', // basics.colors.textAgainstLight
        },
        titleGrid: {
            background: '#ffffff', // colorScheme.surface.level100
            gridBorder: grey[400],
            contentBorder: '#000000',
        },
        background: {
            default: '#eeeeee', // colorScheme.surface.level250
        },
        selection: {
            hover: 'rgba(106, 192, 231, 0.7)', // colorScheme.background.on.pressed
            focus: 'rgba(106, 192, 231, 0.7)', // colorScheme.background.on.pressed
            selected: 'rgba(155, 213, 239, 0.7)', // colorScheme.background.on.hover
            highlighted: 'rgba(205, 234, 247, 0.6)', // colorScheme.background.on.default
        },
        scrollbar: {
            track: '#ffffff', // titleGrid.background
            thumb: 'rgba(128, 128, 128, 0.5)', // darker slider.pressed.halo.color
            active: '#808080', // slider.hover.thumb.color
        },
        monacoTheme: 'light',
        splitterColor: '#0696d7', // colorScheme.reference.accent
    },
};

// HIG Storybook: Dark gray colour scheme
const higDark: ThemeOptions = {
    palette: {
        mode: 'dark',
        text: {
            primary: '#f5f5f5', // basics.colors.textAgainstLight
        },
        titleGrid: {
            background: '#373737', // colorScheme.surface.level250
            gridBorder: grey[800],
            contentBorder: grey[700],
        },
        background: {
            default: '#373737', // colorScheme.surface.level250
        },
        selection: {
            hover: 'rgba(56, 171, 223, 0.45)', // colorScheme.background.on.pressed
            focus: 'rgba(56, 171, 223, 0.45)', // colorScheme.background.on.pressed
            selected: 'rgba(56, 171, 223, 0.3)', // colorScheme.background.on.hover
            highlighted: 'rgba(56, 171, 223, 0.15)', // colorScheme.background.on.default
        },
        scrollbar: {
            track: '#373737', // titleGrid.background
            thumb: 'rgba(255, 255, 255, 0.5)', // darker slider.pressed.halo.color
            active: '#eeeeee', // slider.hover.thumb.color
        },
        monacoTheme: 'vs-dark',
        splitterColor: '#38abdf', // colorScheme.reference.accent
    },
};

// Helper for converting the VS Code properties in to CSS vars.
const v = (vsCodeSetting: string) => `var(--vscode-${vsCodeSetting.replace(/\./g, '-')})`;

const resolveCssVar = (cssVarName: string) => {
    let name = cssVarName;
    if (cssVarName.startsWith('var(')) {
        name = cssVarName.replace('var(', '').replace(')', '');
    }
    return getComputedStyle(document.body).getPropertyValue(name);
};

const vsCodeLight: ThemeOptions = {
    palette: {
        mode: 'light',
        text: {
            primary: v('editor.foreground'),
        },
        background: {
            default: v('editor.background'),
        },
        titleGrid: {
            background: v('sideBar.background'),
            gridBorder: v('input.background'),
            contentBorder: v('panel.border'),
        },
        selection: {
            hover: v('list.highlightForeground'),
            focus: v('list.highlightForeground'),
            selected: v('list.focusOutline'),
            highlighted: v('list.activeSelectionBackground'),
            highlightedText: v('list.activeSelectionForeground'),
        },
        scrollbar: {
            track: v('sideBar.background'), // titleGrid.background
            thumb: v('scrollbarSlider.background'),
            active: v('scrollbarSlider.hoverBackground'),
        },
        monacoTheme: 'light',
        splitterColor: v('sash.hoverBorder'),
    },
    typography: {
        fontSize: parseInt(resolveCssVar(v('font.size')).replace('px', ''), 10),
        fontFamily: v('font.family'),
    },
};

const vsCodeDark: ThemeOptions = { ...vsCodeLight };
if (vsCodeDark.palette) {
    vsCodeDark.palette = {
        ...vsCodeDark.palette,
        mode: 'dark',
        monacoTheme: 'vs-dark',
    };
}

// Create theme with options to override the defaults.
const generateTheme = (
    useLightMode = true,
    useVsCodeStyle = true,
): Theme => {
    let baseOptions: ThemeOptions = {};

    if (useLightMode && useVsCodeStyle) {
        baseOptions = vsCodeLight;
    } else if (useLightMode) {
        baseOptions = higLight;
    } else if (useVsCodeStyle) {
        baseOptions = vsCodeDark;
    } else {
        baseOptions = higDark;
    }

    return createTheme(baseOptions);
};

export default generateTheme;
