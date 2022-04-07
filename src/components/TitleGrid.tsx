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
