import React, { useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import generateTheme from './theme';
import Layout from './components/layout/Layout';
import { vsCodePresent } from './util/fetch-data';

const App: React.FC = () => {
    const [lightMode, setLightMode] = useState(true);

    // The kind is available in data-vscode-theme-kind attribute of <body> element of the WebView.
    const isVsCodeThemeLight = () => (document.body.dataset.vscodeThemeKind !== 'vscode-dark');

    if (vsCodePresent && lightMode !== isVsCodeThemeLight()) {
        setLightMode(!lightMode);
    }

    return (
        <ThemeProvider theme={generateTheme(lightMode, vsCodePresent)}>
            <CssBaseline enableColorScheme />
            <Layout />
        </ThemeProvider>
    );
};

export default App;
