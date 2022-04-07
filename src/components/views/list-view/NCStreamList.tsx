import React, { useContext } from 'react';
import List from './List';
import NCStreamListItem from './items/NCStreamListItem';
import DataContext from '../../../DataContext';

const GCodeList: React.FC = () => {
    const { ncStreamCommands } = useContext(DataContext);

    return (
        <List
            RowComponent={NCStreamListItem}
            data={ncStreamCommands}
        />
    );
};

export default GCodeList;
