import React, { useContext } from 'react';
import List from './List';
import GCodeListItem from './items/GCodeListItem';
import DataContext from '../../../DataContext';

const GCodeList: React.FC = () => {
    const { gCodeCommands } = useContext(DataContext);

    return (
        <List
            RowComponent={GCodeListItem}
            data={gCodeCommands}
        />
    );
};

export default GCodeList;
