import React, { useContext } from 'react';
import ListItem from './ListItem';
import DataContext from '../../../../DataContext';
import { CallStackLineData, LineDataProps } from '../../../../types';

const CallStackListItem: React.FC<LineDataProps> = (
    { style, data, index }: LineDataProps,
) => {
    const { selectedCallStackLine, handleCallStackLineClicked } = useContext(DataContext);
    const stackItem = data[index] as CallStackLineData;
    return (
        <ListItem
            style={style}
            text={`${stackItem.functionSignature} Line: ${stackItem.lineNumber}`}
            selected={stackItem.stackFrameNumber === selectedCallStackLine}
            highlighted={false}
            onClick={() => handleCallStackLineClicked(stackItem)}
        />
    );
};

export default CallStackListItem;
