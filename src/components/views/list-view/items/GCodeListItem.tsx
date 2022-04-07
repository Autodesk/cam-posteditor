import React, { useContext } from 'react';
import {
    LineDataProps, GCodeLineData,
} from '../../../../types';
import DataContext from '../../../../DataContext';
import ListItem from './ListItem';

const GCodeListItem: React.FC<LineDataProps> = (
    { style, data, index }: LineDataProps,
) => {
    const {
        selectedCommandLine,
        handleGCodeLineClicked,
        selectedGCodeLine,
    } = useContext(DataContext);

    return (
        <ListItem
            style={style}
            text={(data[index] as GCodeLineData).output}
            highlighted={data[index].commandLineNumber === selectedCommandLine}
            selected={(data[index] as GCodeLineData).gCodeLineNumber === selectedGCodeLine}
            onClick={() => handleGCodeLineClicked((data[index] as GCodeLineData))}
        />
    );
};

export default GCodeListItem;
