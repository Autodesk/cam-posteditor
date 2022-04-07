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
