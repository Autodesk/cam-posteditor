import React from 'react';
import {
    LineDataProps, FormatLineData,
} from '../../../../types';
import ListItem from './ListItem';

const FormatListItem: React.FC<LineDataProps> = (
    { style, data, index }: LineDataProps,
) => (
    <ListItem
        style={style}
        text={(data[index] as FormatLineData).name}
        highlighted={false}
        selected={false}
        onClick={(): void => {}}
    />
);

export default FormatListItem;
