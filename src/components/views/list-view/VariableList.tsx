import React, { useContext } from 'react';
import List from './List';
import VariableListItem from './items/VariableListItem';
import DataContext from '../../../DataContext';

const VariableList: React.FC = () => {
    const { variableCommands } = useContext(DataContext);

    return (
        <List RowComponent={VariableListItem} data={variableCommands} />
    );
};

export default VariableList;
