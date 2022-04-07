import React, { useContext } from 'react';
import {
    LineDataProps, NCStreamLineData,
} from '../../../../types';
import DataContext from '../../../../DataContext';
import ListItem from './ListItem';
import { NCVector } from '../../../../NCParser/NCCommand';

const formatNumber = (num: number): string => (
    Number.isInteger(num) ? num.toString() : num.toFixed(2)
);

const formatVector = (vec: NCVector): string => (
    `{${formatNumber(vec.x)}, ${formatNumber(vec.y)}, ${formatNumber(vec.z)}}`
);

const formatCommand = ({ commandName, commandArgs }: NCStreamLineData): string => {
    switch (commandName) {
        case 'onRapid':
            return `onRapid(${formatVector(commandArgs.end as NCVector)})`;
        case 'onLinear':
            return `onLinear(${formatVector(commandArgs.end as NCVector)}
                , ${formatNumber(commandArgs.feedrate as number)})`;
        case 'onRapid5D':
            return `onRapid5D(${formatVector(commandArgs.end as NCVector)}
                , ${formatVector(commandArgs.direction as NCVector)})`;
        case 'onLinear5D':
            return `onLinear5D(${formatVector(commandArgs.end as NCVector)}
                , ${formatVector(commandArgs.direction as NCVector)}
                , ${formatNumber(commandArgs.feedrate as number)})`;
        case 'onCWArc':
        case 'onCCWArc':
        case 'onCWCircle':
        case 'onCCWCircle':
            return `${commandName}(${formatVector(commandArgs.center as NCVector)}
                , ${formatVector(commandArgs.end as NCVector)}
                , ${formatVector(commandArgs.normal as NCVector)}
                , ${formatNumber(commandArgs.feedrate as number)})`;
        case 'onCircular':
            return `onCircular(${formatVector(commandArgs.center as NCVector)}
                , ${formatVector(commandArgs.end as NCVector)}
                , ${formatVector(commandArgs.normal as NCVector)}
                , ${formatNumber(commandArgs.sweep as number)}
                , ${formatNumber(commandArgs.feedrate as number)})`;
        default:
            if (!commandArgs) { return `${commandName}()`; }
            //  For any missing cases:
            return `${commandName}(${JSON.stringify(commandArgs)})`;
    }
};

const NCStreamListItem: React.FC<LineDataProps> = (
    { style, data, index }: LineDataProps,
) => {
    const { selectedCommandLine, handleNCStreamLineClicked } = useContext(DataContext);

    const lineData = data[index] as NCStreamLineData;

    return (
        <ListItem
            style={style}
            text={formatCommand(lineData)}
            selected={lineData.commandLineNumber === selectedCommandLine}
            highlighted={false}
            onClick={() => handleNCStreamLineClicked(lineData)}
        />
    );
};

export default NCStreamListItem;
