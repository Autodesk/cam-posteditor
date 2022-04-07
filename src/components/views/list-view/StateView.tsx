import React, { useContext } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import DataContext from '../../../DataContext';

declare type GetValueAsStringFunction = (value: string | boolean | number) => string;
const getValueAsString: GetValueAsStringFunction = (value: string | boolean | number): string => {
    // Deal with <UNSPECIFIED>
    if (typeof value === 'object' || typeof value === 'undefined') {
        return '<UNSPECIFIED>';
    }

    if (typeof value !== 'string') {
        return value.toString();
    }
    return value;
};

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

const StyledRow = styled(TableRow, {
    shouldForwardProp: (prop) => (
        // Don't forward these props to <TableRow> because it doesn't need/understand them.
        prop !== 'key'
        && prop !== 'sx'
        && prop !== 'selected'
        && prop !== 'highlighted'
    ),
})<StyledProps>(({ theme, selected, highlighted }) => ({
    backgroundColor: resolveBackgroundColor(theme, highlighted, selected),
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

const StateView: React.FC = () => {
    const { currentState, handleVariableLineClicked, selectedVariable } = useContext(DataContext);
    return (
        <TableContainer sx={{ maxHeight: '100%', maxWidth: '50%' }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Properties</TableCell>
                        <TableCell sx={{ width: '30%' }}>Values</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {currentState.map((state) => (
                        <StyledRow
                            key={state.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            selected={state.name === selectedVariable}
                            highlighted={false}
                            onClick={() => { handleVariableLineClicked(state); }}
                        >
                            <TableCell component="th" scope="row">
                                {state.name}
                            </TableCell>
                            <TableCell>
                                {
                                    // Get the last changed value for now
                                    getValueAsString(state.value)
                                }
                            </TableCell>
                        </StyledRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StateView;
