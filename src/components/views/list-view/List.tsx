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
