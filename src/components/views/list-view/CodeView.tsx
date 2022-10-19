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
import React, { useContext, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useTheme } from '@mui/material/styles';
import DataContext from '../../../DataContext';

const StartColumn = 0;
const EndColumn = 1000;

const CodeView: React.FC = () => {
    const theme = useTheme();
    const { postFileContents, selectedPostFileLine } = useContext(DataContext);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

    const editorOnMount: OnMount = (
        editor: monaco.editor.IStandaloneCodeEditor,
    ) => {
        editorRef.current = editor;
        editorRef.current?.updateOptions({ readOnly: true });
    };

    useEffect(() => {
        if (selectedPostFileLine != null) {
            // editorRef.current?.focus();
            editorRef.current?.setSelection(
                new monaco.Selection(
                    selectedPostFileLine,
                    StartColumn,
                    selectedPostFileLine,
                    EndColumn,
                ),
            );
            editorRef.current?.revealLineInCenter(selectedPostFileLine);
        }
    }, [editorRef, selectedPostFileLine]);

    return (
        <Editor
            height="100%"
            defaultLanguage="javascript"
            value={postFileContents}
            onMount={editorOnMount}
            theme={theme.palette.monacoTheme}
        />
    );
};

export default CodeView;
