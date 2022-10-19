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
    ReactElement, useRef,
} from 'react';
import { MUIStyledCommonProps, SxProps } from '@mui/system';
import { Grid, GridProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    validateSizes,
    equalSizes,
    sumArray,
    distanceInPX,
    roundDecimal,
} from './util';
import DragDivider from './DragDivider';

/** Wrapper to expose `sx` and other props. */
const StyledDiv = styled('div')({});

interface Props extends GridProps {
    /**
     * ! Children must support MUI's `sx` prop otherwise this will not work.
     */
    children: ReactElement<MUIStyledCommonProps>[],
    /**
     * A list of initial sizes in percentages. Must be the same length as the number
     * of children. The values must add to 100.
     */
    initialSizes?: number[],
    /**
     * Minimum size (in PX) of each section, either height or width depending on the
     * split orientation. Must be at least 100.
     */
    minSize?: number,
    /** Split orientation. */
    orientation?: 'vertical' | 'horizontal',
    /**
     * If provided, it will be used to remember the latest sizes (in local
     * storage) and will used them on next load. If the sizes are stored
     * and they are still valid, they will be used, otherwise the
     * `initialSizes` will be used if provided.
     * This needs to be unique for each SplitGrid.
     */
    storeId?: string,
}

const SplitGrid: React.FC<Props> = ({
    children, initialSizes, minSize = 100, orientation = 'vertical', storeId, ...gridProps
}: Props) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const childrenRefs = useRef<HTMLDivElement[]>(new Array<HTMLDivElement>(children.length));
    const horizontalSplit = orientation === 'horizontal';

    let initSizes: number[] = [];
    if (storeId && storeId.length > 0) {
        const storedVal = localStorage.getItem(storeId);
        if (storedVal) {
            let savedSizes = JSON.parse(storedVal) as number[];
            savedSizes = validateSizes(savedSizes);
            if (savedSizes.length === children.length) {
                initSizes = savedSizes;
            }
        }
    }

    // If no stored values (or invalid), try to use `initialSizes`
    if (initSizes.length !== children.length) {
        initSizes = validateSizes(initialSizes ?? []);
    }

    // If no initial sizes (or invalid), use equal splits
    if (initSizes.length !== children.length) {
        initSizes = equalSizes(children.length);
    }
    const sizes = useRef<number[]>(initSizes);

    const storeSizes = () => {
        if (storeId && storeId.length > 0) {
            const saveSizes = sizes.current.map((s) => roundDecimal(s, 10));
            const sum = sumArray(saveSizes);
            if (sum > 100) {
                // Happens because of floating points;
                // adjust the last value so tht the sum
                // becomes 100 and the saved value is valid.
                const diff = sum - 100;
                saveSizes[saveSizes.length - 1] -= diff;
            }
            localStorage.setItem(storeId, JSON.stringify(saveSizes));
        }
    };

    const handleResizeChildren = (distInPercent: number, ind1: number, ind2: number) => {
        const first = childrenRefs.current[ind1];
        const second = childrenRefs.current[ind2];
        const firstNewSize = sizes.current[ind1] - distInPercent;
        const secondNewSize = sizes.current[ind2] + distInPercent;
        if (horizontalSplit) {
            first.style.height = `${firstNewSize}%`;
            second.style.height = `${secondNewSize}%`;
        } else {
            first.style.width = `${firstNewSize}%`;
            second.style.width = `${secondNewSize}%`;
        }
        sizes.current[ind1] = firstNewSize;
        sizes.current[ind2] = secondNewSize;
        storeSizes();
    };

    const sumOfChildrenSizes = (
        index: number,
    ) => distanceInPX(sumArray(sizes.current, index), gridRef, horizontalSplit);

    return (
        <Grid
            // Spread all GridProps to the underlying Grid component
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...gridProps}
            sx={{
                ...(gridProps.sx ? gridProps.sx : {}),
                position: 'relative',
                height: '100%',
                width: '100%',
                overflow: 'auto',
            }}
            ref={gridRef}
        >
            {React.Children.map(children, (child, index) => {
                if (!React.isValidElement(child)) {
                    return undefined;
                }
                const newProps = { ...child.props };

                if (!newProps.sx) {
                    newProps.sx = {};
                }
                newProps.sx = {
                    ...newProps.sx,
                    width: '100%',
                    height: '100%',
                } as SxProps;

                return (
                    <>
                        <StyledDiv
                            ref={(el: HTMLDivElement) => {
                                childrenRefs.current[index] = el;
                            }}
                            sx={{
                                width: horizontalSplit ? '100%' : `${sizes.current[index]}%`,
                                height: horizontalSplit ? `${sizes.current[index]}%` : '100%',
                            }}
                        >
                            {React.cloneElement(child, newProps)}
                        </StyledDiv>
                        {
                            index > 0 && index < children.length
                                ? (
                                    <DragDivider
                                        beforePercent={sumArray(sizes.current, index)}
                                        onDragged={(distance) => {
                                            handleResizeChildren(distance, index - 1, index);
                                        }}
                                        parentRef={gridRef}
                                        childrenCount={children.length}
                                        firstIndex={index - 1}
                                        secondIndex={index}
                                        sumOfChildrenSizes={sumOfChildrenSizes}
                                        minSize={minSize}
                                        horizontalSplit={horizontalSplit}
                                    />
                                )
                                : undefined
                        }
                    </>
                );
            })}
        </Grid>
    );
};

SplitGrid.defaultProps = {
    initialSizes: [],
    minSize: 100,
    orientation: 'vertical',
    storeId: undefined,
} as Partial<Props>;

export default SplitGrid;
