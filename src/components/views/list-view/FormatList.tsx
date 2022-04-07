import React, { useContext } from 'react';
import List from './List';
import FormatListItem from './items/FormatListItem';
import DataContext from '../../../DataContext';

const FormatList: React.FC = () => {
    const { formatCommands } = useContext(DataContext);

    return (
        <List RowComponent={FormatListItem} data={formatCommands} />
    );
};

export default FormatList;
