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
    useState, useRef, useEffect, useCallback, RefObject,
} from 'react';
import { styled } from '@mui/material/styles';
import {
    distanceInPercent,
} from './util';

/** Wrapper to expose `sx` and other props. */
const StyledDiv = styled('div')({});

interface DragDividerProps {
    /** Initial divider offset from the left/top in percent. */
    beforePercent: number,
    /**
     * Triggered when the component was dragged. The distance is negative
     * when dragged to the left/top, positive otherwise. It represents the
     * change in PX.
     */
    onDragged: (distancePX: number) => void,
    /** Ref to the parent component. */
    parentRef: RefObject<HTMLDivElement>,
    /** Number of all children. */
    childrenCount: number,
    /** Index of the child on the left/top. */
    firstIndex: number,
    /** Index of the child on the right/bottom. */
    secondIndex: number,
    /**
     * Must return the sum of widths/heights (in PX) of all children up to the index (excluding).
     */
    sumOfChildrenSizes: (index: number) => number,
    /** See `minSize` in SplitGrid props. */
    minSize: number,
    /** True if splitting horizontally. */
    horizontalSplit: boolean
}

// Size of draggable area, not shown
const DIVIDER_SIZE_PX = 4;
// Size of the hover indicator, shown when not hovered
const DIVIDER_INITIAL_SIZE_PX = 1;
// Size of the hover indicator, shown on hover
const DIVIDER_HOVER_SIZE_PX = 4;

const DragDivider: React.FC<DragDividerProps> = ({
    beforePercent,
    onDragged,
    parentRef,
    childrenCount,
    firstIndex,
    secondIndex,
    sumOfChildrenSizes,
    minSize,
    horizontalSplit,
}: DragDividerProps) => {
    const dividerRef = useRef<HTMLDivElement>(null);
    const [inDrag, setInDrag] = useState(false);
    const positionOffset = useRef<number>(beforePercent);

    const stopPropagation = (e: MouseEvent) => {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
    };

    const onDragStart = useCallback(() => {
        setInDrag(true);
    }, []);

    const onDragEnd = useCallback(() => {
        setInDrag(false);
    }, []);

    const onDrag = useCallback((e: MouseEvent) => {
        if (inDrag && dividerRef.current && parentRef.current) {
            stopPropagation(e);
            const parentBox = parentRef.current.getBoundingClientRect();
            const parentOrigin = horizontalSplit ? parentBox.y : parentBox.x;
            const pageOffset = horizontalSplit ? e.pageY : e.pageX;

            // distance of mouse from left edge of parent
            const parentOffset = pageOffset - parentOrigin;
            if (parentOffset < 0) {
                // Moved outside of parent
                return;
            }

            const dividerBox = dividerRef.current.getBoundingClientRect();
            const dividerOrigin = horizontalSplit ? dividerBox.y : dividerBox.x;

            // distance of divider from left edge of parent
            const dividerOffset = dividerOrigin
                + DIVIDER_SIZE_PX / 2 - parentOrigin;

            // distance of the previous divider from left edge of parent
            let prevDividerOffset = 0;
            if (firstIndex > 0) {
                prevDividerOffset = sumOfChildrenSizes(firstIndex) + DIVIDER_SIZE_PX / 2;
            }

            // distance of the next divider from the left edge of parent
            let nextDividerOffset = horizontalSplit ? parentBox.height : parentBox.width;
            if (secondIndex < childrenCount - 1) {
                nextDividerOffset = sumOfChildrenSizes(secondIndex + 1);
            }

            // Calculate the change to use for resizing
            const diffInPX = dividerOffset - parentOffset;
            const diffInPercent = distanceInPercent(diffInPX, parentRef, horizontalSplit);

            if (diffInPX > 0 && dividerOffset < prevDividerOffset + minSize) {
                // Cannot move past the previous divider
                return;
            }
            if (diffInPX < 0 && dividerOffset > nextDividerOffset - minSize) {
                // Cannot move past the next divider
                return;
            }

            const newPositionOffset = positionOffset.current - diffInPercent;
            positionOffset.current = newPositionOffset;
            if (horizontalSplit) {
                dividerRef.current.style.top = `${newPositionOffset}%`;
            } else {
                dividerRef.current.style.left = `${newPositionOffset}%`;
            }

            onDragged(diffInPercent);
        }
    }, [
        inDrag,
        onDragged,
        parentRef,
        childrenCount,
        firstIndex,
        secondIndex,
        sumOfChildrenSizes,
        minSize,
        horizontalSplit,
    ]);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (e.target === dividerRef.current) {
                stopPropagation(e);
                onDragStart();
            } else {
                onDragEnd();
            }
        };

        const onMouseUp = () => {
            onDragEnd();
        };

        const onMouseMove = (e: MouseEvent) => {
            onDrag(e);
        };

        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);

        return () => {
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [onDragStart, onDragEnd, onDrag]);

    return (
        <StyledDiv
            ref={dividerRef}
            sx={{
                // Functional properties
                width: horizontalSplit ? '100%' : `${DIVIDER_SIZE_PX}px`,
                height: horizontalSplit ? `${DIVIDER_SIZE_PX}px` : '100%',
                position: 'absolute',
                left: horizontalSplit ? 0 : `${positionOffset.current}%`,
                top: horizontalSplit ? `${positionOffset.current}%` : 0,
                transform: horizontalSplit ? 'translateY(-50%)' : 'translateX(-50%)',
                zIndex: 100,
                touchAction: 'none',

                // Styling properties
                backgroundColor: 'transparent',
                cursor: horizontalSplit ? 'ns-resize' : 'ew-resize',

                // Indicator styling
                '&::before': {
                    content: "''",
                    pointerEvents: 'none',
                    position: 'absolute',
                    width: horizontalSplit ? '100%' : `${DIVIDER_INITIAL_SIZE_PX}px`,
                    height: horizontalSplit ? `${DIVIDER_INITIAL_SIZE_PX}px` : '100%',
                    left: horizontalSplit ? 0 : `calc(50% - ${DIVIDER_INITIAL_SIZE_PX}px/2)`,
                    top: horizontalSplit ? `calc(50% - ${DIVIDER_INITIAL_SIZE_PX}px/2)` : 0,
                    transition: 'background-color .1s ease-out',
                    backgroundColor: 'titleGrid.gridBorder',
                },
                '&:hover': {
                    '&::before': {
                        width: horizontalSplit ? '100%' : `${DIVIDER_HOVER_SIZE_PX}px`,
                        height: horizontalSplit ? `${DIVIDER_HOVER_SIZE_PX}px` : '100%',
                        left: horizontalSplit ? 0 : `calc(50% - ${DIVIDER_HOVER_SIZE_PX}px/2)`,
                        top: horizontalSplit ? `calc(50% - ${DIVIDER_HOVER_SIZE_PX}px/2)` : 0,
                        backgroundColor: 'splitterColor',
                    },
                },
            }}
        />
    );
};

export default DragDivider;
