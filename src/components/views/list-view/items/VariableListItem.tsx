import React, { useContext } from 'react';
import {
    LineDataProps, VariableLineData,
} from '../../../../types';
import DataContext from '../../../../DataContext';
import ListItem from './ListItem';

const VariableListItem: React.FC<LineDataProps> = (
    { style, data, index }: LineDataProps,
) => {
    const { relevantVariables } = useContext(DataContext);
    const variable = (data[index] as VariableLineData).name;
    return (
        <ListItem
            style={style}
            text={variable}
            highlighted={relevantVariables.includes(variable)}
            selected={false}
            onClick={(): void => {}}
        />
    );
};

export default VariableListItem;
