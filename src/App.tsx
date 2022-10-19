/*
Copyright (c) 2021 by Autodesk, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
