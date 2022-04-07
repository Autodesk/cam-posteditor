import React from 'react';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import MiddleColumn from './MiddleColumn';
import DataProvider from '../../DataProvider';
import GCodeList from '../views/list-view/GCodeList';
import NCStreamList from '../views/list-view/NCStreamList';
import TitleGrid from '../TitleGrid';
import Viewer3D from '../views/Viewer3D';
import SplitGrid from '../splitter/SplitGrid';

const StyledSplitter = styled(SplitGrid)(({ theme }) => ({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize,

    // Only customise if options were provided, otherwise leave default.
    // Overriding any option will reset all of them.
    ...(theme.palette.scrollbar ? {

        // Scrollbar customisation, based on MUI darkScrollbar:
        // https://github.com/mui-org/material-ui/blob/353cecb5391571163eb6bd8cbf36d2dd299aaf56/packages/mui-material/src/darkScrollbar/index.ts

        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: theme.palette.scrollbar.track,
            width: theme.spacing(1),
            height: theme.spacing(1),
        },
        '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            borderRadius: 0,
        },
        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.scrollbar.thumb,
            minHeight: 24,
            border: `3px solid ${theme.palette.scrollbar.track}`,
        },
        '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: theme.palette.scrollbar.active,
        },
        '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: theme.palette.scrollbar.active,
        },
        '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme.palette.scrollbar.active,
        },
        '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: theme.palette.scrollbar.track,
        },
    } : {}),
}));

const Layout: React.FC = () => (
    <DataProvider>
        <StyledSplitter
            container
            initialSizes={[20, 60, 20]}
            storeId="layout"
            minSize={200}
        >
            <TitleGrid item title="CAM input (NC Stream)">
                <NCStreamList />
            </TitleGrid>
            <Grid item sx={{ height: '100%' }}>
                <MiddleColumn />
            </Grid>
            <TitleGrid item title="NC Output">
                <SplitGrid container storeId="nc-output" orientation="horizontal" minSize={200} style={{ height: '100%' }}>
                    <Grid item title="G-Code" style={{ height: '100%' }}>
                        <GCodeList />
                    </Grid>
                    <Grid item title="3D View" style={{ height: '100%', padding: '5px' }}>
                        <Viewer3D />
                    </Grid>
                </SplitGrid>
            </TitleGrid>
        </StyledSplitter>
    </DataProvider>
);

export default Layout;
