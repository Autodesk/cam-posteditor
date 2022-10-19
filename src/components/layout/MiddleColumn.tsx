/*
Copyright (c) 2021 by Autodesk, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
