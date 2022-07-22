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
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React from 'react';
import { styled, Theme } from '@mui/material/styles';
import { handleKeyDownAsOnClick } from '../../../../util/utils';

interface Props {
    text: string,
    highlighted: boolean,
    selected: boolean,
    style: React.CSSProperties,
    onClick: () => void
}

interface StyledProps {
    highlighted: boolean,
    selected: boolean,
}

const resolveBackgroundColor = (
    theme: Theme,
    highlighted: boolean,
    selected: boolean,
) => {
    if (selected) {
        return theme.palette.selection.selected;
    }
    if (highlighted) {
        return theme.palette.selection.highlighted;
    }
    return undefined;
};

const StyledDiv = styled('div', {
    // Don't forward these props to <div> because it doesn't need/understand them.
    shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'highlighted',
})<StyledProps>(({
    theme,
    selected,
    highlighted,
}) => ({
    border: '1px solid transparent', // prevent jumpy border
    cursor: 'pointer',
    backgroundColor: resolveBackgroundColor(theme, highlighted, selected),
    padding: '0 4px',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    '&:hover': {
        backgroundColor: theme.palette.selection.hover,
        color: theme.palette.selection.highlightedText, // may be undefined
    },
    '&:focus-visible': {
        backgroundColor: theme.palette.selection.focus,
        color: theme.palette.selection.highlightedText, // may be undefined
        outline: 'none',
    },
}));

const ListItem: React.FC<Props> = ({
    style, text, selected, highlighted, onClick,
}: Props) => (
    <StyledDiv
        style={style}
        onClick={onClick}
        role="button"
        onKeyPress={handleKeyDownAsOnClick(onClick)}
        tabIndex={0}
        highlighted={highlighted}
        selected={selected}
    >
        {text}
    </StyledDiv>
);

export default ListItem;
