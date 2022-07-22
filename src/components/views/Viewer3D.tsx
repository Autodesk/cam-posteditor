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
import React, { useContext } from 'react';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color4 } from '@babylonjs/core/Maths/math.color';
import {
    Scene,
    Engine,
    useEngine,
    useCanvas,
    useCamera,
} from 'react-babylonjs';
import { ArcRotateCamera } from '@babylonjs/core';
import DataContext from '../../DataContext';
import { ToolPathSection } from '../../types';

let version = 0;

const ConfigureCamera = () => {
    const camera = useCamera((s) => {
        if (s.activeCamera != null) {
            return s.activeCamera;
        }
        return new ArcRotateCamera('invalid', 0, 0, 0, Vector3.Zero(), s, false);
    }) as ArcRotateCamera;

    if (camera) {
        camera.cameraDirection = new Vector3(0, 0, -1);
        camera.upVector = new Vector3(0, 0, 1);
    }

    return null;
};

const ConfigureCanvas = () => {
    const engine = useEngine();
    const canvas = useCanvas() as HTMLCanvasElement;

    if (canvas) {
        canvas.setAttribute('style', 'width:100%; height:100%');
    }

    window.addEventListener('resize', () => engine?.resize());

    return null;
};

const App: React.FC = () => {
    const { toolPathData, selectedCommandLine } = useContext(DataContext);

    const toolPath: ToolPathSection[] = ((toolPathData as unknown) as ToolPathSection[]);
    let markerPosition = new Vector3(0, 0, 0);
    if (toolPath.length > 0) {
        const index = toolPath.findIndex((tp) => tp.commandIndex >= selectedCommandLine);
        if (index >= 0) {
            [markerPosition] = toolPath[index].segments;
        }
    }

    const toolPathSegments: Vector3[][] = toolPath.map((tp) => tp.segments);
    const colors: Color4[][] = toolPath.map((tp) => tp.colors);
    version += 1;
    return (
        <div style={{ flex: 1, display: 'flex', height: '100%' }}>
            <Engine adaptToDeviceRatio antialias canvasId="sample-canvas">
                <Scene>
                    <ConfigureCanvas />
                    <ConfigureCamera />
                    <hemisphericLight name="hemi" direction={new Vector3(0, -1, 0)} intensity={0.8} />
                    <arcRotateCamera
                        name="arc"
                        noRotationConstraint
                        target={new Vector3(0, 0, 0)}
                        alpha={Math.PI / 2}
                        beta={Math.PI / 2}
                        radius={300}
                        position={new Vector3(0, 0, -300)}
                    />
                    <sphere name="selection-marker" diameter={10} segments={16} position={markerPosition} />
                    <lineSystem
                        key={`track-${version}`}
                        name="toolpaths"
                        lines={toolPathSegments}
                        colors={colors}
                    />
                </Scene>
            </Engine>
        </div>
    );
};

export default App;
