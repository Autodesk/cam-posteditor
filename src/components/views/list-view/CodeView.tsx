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
