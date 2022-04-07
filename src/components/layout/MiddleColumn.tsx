import React from 'react';
import FormatList from '../views/list-view/FormatList';
import VariableList from '../views/list-view/VariableList';
import CodeView from '../views/list-view/CodeView';
import StateView from '../views/list-view/StateView';
import TitleGrid from '../TitleGrid';
import CallStackList from '../views/list-view/CallStackList';
import SplitGrid from '../splitter/SplitGrid';

const MiddleColumn: React.FC = () => (
    <SplitGrid
        container
        orientation="horizontal"
        initialSizes={[25, 50, 25]}
        storeId="middle-main"
        minSize={200}
    >
        <SplitGrid container storeId="middle-top" minSize={200}>
            <TitleGrid item title="Formats">
                <FormatList />
            </TitleGrid>
            <TitleGrid item title="Variables">
                <VariableList />
            </TitleGrid>
        </SplitGrid>
        <TitleGrid item xs={12} title="Code View">
            <div style={{ height: '100%' }}>
                <div style={{ height: '20%' }}><CallStackList /></div>
                <div style={{ height: '80%' }}><CodeView /></div>
            </div>
        </TitleGrid>
        <TitleGrid item xs={12} title="State">
            <StateView />
        </TitleGrid>
    </SplitGrid>
);

export default MiddleColumn;
