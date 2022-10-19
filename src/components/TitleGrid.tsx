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
import { styled } from '@mui/material/styles';
import { Grid, GridProps } from '@mui/material';

interface Props extends GridProps {
    children: React.ReactElement,
    title: string,
}

const OuterDiv = styled(Grid)(({ theme }) => ({
    // padding: theme.spacing(1),
    paddingTop: theme.spacing(1.5),
}));

const BorderDiv = styled('div')({
    // border: `1px solid ${theme.palette.titleGrid.gridBorder}`,
    position: 'relative',
    height: '100%',
    display: 'flex',
});

const TitleDiv = styled('div')(({ theme }) => ({
    height: '1.2rem',
    position: 'absolute',
    left: theme.spacing(0.7),
    paddingLeft: theme.spacing(0.3),
    paddingRight: theme.spacing(0.3),
    fontSize: '0.8rem',
    background: theme.palette.background.default,
    top: 0,
    transform: 'translateY(-50%)',
}));

const ContentDiv = styled('div')(({ theme }) => ({
    border: `1px solid ${theme.palette.titleGrid.contentBorder}`,
    background: theme.palette.titleGrid.background,
    margin: theme.spacing(1), // same as `left` in TitleDiv
    marginTop: theme.spacing(1.5),
    width: `calc(100% - ${theme.spacing(2)})`,
}));

const TitleGrid: React.FC<Props> = ({
    title, children, ...gridProps
}: Props) => (
    // Spread all GridProps to the underlying Grid component
    // eslint-disable-next-line react/jsx-props-no-spreading
    <OuterDiv {...gridProps}>
        <BorderDiv>
            <TitleDiv>{title}</TitleDiv>
            <ContentDiv>{children}</ContentDiv>
        </BorderDiv>
    </OuterDiv>
);

export default TitleGrid;
