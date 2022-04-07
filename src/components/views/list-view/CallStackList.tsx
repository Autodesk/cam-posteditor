import React, { useContext } from 'react';
import DataContext from '../../../DataContext';
import CallStackListItem from './items/CallStackListItem';
import List from './List';

const CallStackList: React.FC = () => {
    const { selectedCallStack } = useContext(DataContext);
    return (
        <List
            RowComponent={CallStackListItem}
            data={(selectedCallStack?.callStackData ?? [])}
        />
    );
};

export default CallStackList;
