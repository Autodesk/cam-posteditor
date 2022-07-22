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
import React, {
    useRef, useContext, useEffect, useCallback,
} from 'react';
import { FixedSizeList } from 'react-window';
import { useTheme } from '@mui/material/styles';
import { useResizeDetector } from 'react-resize-detector';
import DataContext from '../../../DataContext';
import { LineData, LineDataProps } from '../../../types';

interface Props {
    RowComponent: React.FC<LineDataProps>,
    data: LineData[],
}

const List: React.FC<Props> = ({ RowComponent, data }: Props) => {
    const theme = useTheme();
    const listRef = useRef<FixedSizeList>(null);
    const { height: listHeight, ref: listViewRef } = useResizeDetector();

    const { selectedCommandLine } = useContext(DataContext);

    const findIndexOfFirstSelectedItem = useCallback(() => {
        for (let i = 0; i < data.length; ++i) {
            if (data[i].commandLineNumber === selectedCommandLine) {
                return i;
            }
        }
        return -1;
    }, [data, selectedCommandLine]);

    const scrollToFirstSelectedItem = useCallback(() => {
        if (listRef.current) {
            const firstSelectedIndex = findIndexOfFirstSelectedItem();
            if (firstSelectedIndex >= 0) {
                listRef.current.scrollToItem(firstSelectedIndex, 'smart');
            }
        }
    }, [findIndexOfFirstSelectedItem]);

    useEffect(() => {
        scrollToFirstSelectedItem();
    }, [selectedCommandLine, scrollToFirstSelectedItem, data]);

    return (
        <div ref={listViewRef} style={{ height: '100%', overflow: 'hidden' }}>
            <FixedSizeList
                ref={listRef}
                height={listHeight ?? 200}
                itemCount={data.length}
                itemSize={theme.typography.fontSize + 4}
                width="100%"
                itemData={data}
                style={{
                    overflowX: 'auto',
                }}
            >
                {RowComponent}
            </FixedSizeList>
        </div>
    );
};

export default List;
