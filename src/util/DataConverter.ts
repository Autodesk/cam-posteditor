/* eslint-disable @typescript-eslint/indent */
import {
    Color4,
    Matrix,
    Plane,
    Vector3,
} from '@babylonjs/core';
import {
    GCodeLineData,
    NCStreamLineData,
    FormatLineData,
    VariableLineData,
    CallStackData,
    CallStackLineData,
    VariableData,
    VariableEventData,
    ToolPathSection,
} from '../types';
import NCProgram from '../NCParser/NCProgram';
import PostScriptData from '../post-parser/PostScriptData';
import NCOutputEvent from '../NCParser/NCOutputEvent';
import NCChangeEvent from '../NCParser/NCChangeEvent';

declare type NCExtractFunction = (data: NCProgram) => NCStreamLineData[];
const extractNcStreamLineData: NCExtractFunction = (
    data: NCProgram,
): NCStreamLineData[] => data.commands
    .map((event, commandNumber) => ({
        // Map command with original command number (before filtering)
        ...event,
        commandNumber,
    }))
    // We are ignoring onParameter commands for now
    .filter((c) => c.name !== 'onParameter')
    .map((command) => {
        const { commandNumber } = command;
        return {
            commandName: command.name,
            commandArgs: command.args,
            commandLineNumber: commandNumber,
        };
    });

declare type GCodeExtractFunction = (data: NCProgram) => GCodeLineData[];
const extractGCodeLineData: GCodeExtractFunction = (
    data: NCProgram,
): GCodeLineData[] => data.commands
    .flatMap((command, commandLineNumber) => command.invocations
        .flatMap(
            (invocation, invocationNumber) => invocation.events
                .map((event, eventNumber) => ({
                    // Map event with original event number (before filtering)
                    ...event,
                    eventNumber,
                }))
                .filter((event) => event.type === 'output')
                .map((event) => {
                    const { eventNumber } = event;
                    const outputEvent = ((event as unknown) as NCOutputEvent);
                    return {
                        output: outputEvent.output,
                        commandLineNumber,
                        invocationNumber,
                        eventNumber,
                        gCodeLineNumber: -1,
                    };
                }),
        ))
    .map((outputEvent, gCodeLineNumber) => ({
        ...outputEvent,
        gCodeLineNumber,
    }));

declare type FormatExtractFunction = (data: PostScriptData) => FormatLineData[];
const extractFormatLineData: FormatExtractFunction = (
    data: PostScriptData,
): FormatLineData[] => data.formats.map(
    (format) => ({ name: format, commandLineNumber: -1 }),
);

declare type VariableExtractFunction = (data: PostScriptData) => VariableLineData[];
const extractVariableLineData: VariableExtractFunction = (
    data: PostScriptData,
): VariableLineData[] => data.variables.map(
    (variable) => ({ name: variable, commandLineNumber: -1 }),
);

declare type StateExtractFunction = (data: NCProgram) => VariableData[];
const extractStateData: StateExtractFunction = (
    data: NCProgram,
): VariableData[] => {
    const variableEvents = data.commands
        .flatMap((command, commandLineNumber) => command.invocations
            .flatMap(
                (invocation, invocationNumber) => invocation.events
                    .map((event, eventNumber) => ({
                        // Map event with original event number (before filtering)
                        ...event,
                        eventNumber,
                    }))
                    .filter((event) => event.type === 'change')
                    .map((event) => {
                        const { eventNumber } = event;
                        const variableChangeEvent = ((event as unknown) as NCChangeEvent);
                        return {
                            name: variableChangeEvent.variable,
                            value: variableChangeEvent.value,
                            commandLineNumber,
                            invocationNumber,
                            eventNumber,
                        };
                    }),
            ));
    // Group variables
    const variableMap: { [key: string]: VariableEventData[] } = variableEvents.reduce(
        (entryMap, entry) => {
            const newEntryMap: { [key: string]: VariableEventData[] } = { ...entryMap };
            const newEntry: VariableEventData = {
                value: entry.value,
                commandLineNumber: entry.commandLineNumber,
                invocationNumber: entry.invocationNumber,
                eventNumber: entry.eventNumber,
            };
            if (!newEntryMap[entry.name]) {
                newEntryMap[entry.name] = [newEntry];
            } else {
                newEntryMap[entry.name].push(newEntry);
            }
            return newEntryMap;
        },
        {},
    );

    const result = Object.keys(variableMap).map((d) => ({
        name: d,
        events: variableMap[d],
    }));

    return result;
};

declare type CallExtractFunction = (data: NCProgram, postData: PostScriptData) => CallStackData[];
const extractCallStackLineData: CallExtractFunction = (
    data: NCProgram,
    postData: PostScriptData,
): CallStackData[] => (
    // Build list of call stacks
    data.commands
        .flatMap((command, commandLineNumber) => command.invocations
            .flatMap(
                (invocation, invocationNumber) => invocation.events
                    .map((event, eventNumber) => ({
                    // Map event with original event number (before filtering)
                        ...event,
                        eventNumber,
                    }))
                    .map((event) => {
                        const { eventNumber } = event;
                        const callstackLineData: CallStackLineData[] = event.callstack
                            .map<CallStackLineData>(
                                (cs, stackFrameNumber) => ({
                                    commandLineNumber,
                                    stackFrameNumber,
                                    functionSignature: postData.functions.find(({ lineNumber }) => lineNumber < cs.lineNumber)?.definition ?? '',
                                    lineNumber: cs.lineNumber,
                                }),
                            );
                        return {
                            commandLineNumber,
                            invocationNumber,
                            eventNumber,
                            callStackData: callstackLineData,
                        };
                    }),
            ))
);

declare type CreateLinearMoveFunction =
    (commandIndex: number, start: Vector3, end: Vector3) => ToolPathSection;
const createLinearMove: CreateLinearMoveFunction = (
    commandIndex: number,
    start: Vector3,
    end: Vector3,
) => {
    const color = new Color4(0.274, 0.76, 0.25, 1);
    return { commandIndex, colors: [color, color], segments: [start, end] };
};

const createRapidMove: CreateLinearMoveFunction = (
    commandIndex: number,
    start: Vector3,
    end: Vector3,
) => {
    const color = new Color4(0.83, 0.384, 0.18, 1);
    return { commandIndex, colors: [color, color], segments: [start, end] };
};

declare type CreateArcMoveFunction =
    (commandIndex: number,
     start: Vector3, centre: Vector3, end: Vector3, normal: Vector3) => ToolPathSection;
const createArcMove: CreateArcMoveFunction = (
    commandIndex: number,
    start: Vector3,
    centre: Vector3,
    end: Vector3,
    normal: Vector3,
) => {
    const startPlane = Plane.FromPositionAndNormal(start, normal);
    const distanceAlongNormal = startPlane.signedDistanceTo(end);
    const endProjected = end.subtract(normal.normalize().scale(distanceAlongNormal));

    const vector1 = start.subtract(centre);
    const vector2 = endProjected.subtract(centre);
    const origin = centre;

    const dot = Vector3.Dot(vector1, vector2);
    const angle = Math.acos(dot / (vector1.length() * vector2.length()));

    const numberOfPoints = 20;
    let matrix: Matrix;
    let rotated: Vector3;
    const points: Vector3[] = [];
    const colors: Color4[] = [];
    const ang = angle / numberOfPoints;
    const normalStep = normal.normalize().scale(distanceAlongNormal / numberOfPoints);
    const color = new Color4(0.2, 0.66, 0.92, 1);
    for (let i = 0; i < numberOfPoints; i++) {
        matrix = Matrix.RotationAxis(normal, ang * i);
        rotated = Vector3.TransformCoordinates(vector1, matrix);
        rotated = rotated.add(normalStep.scale(i));
        points.push(rotated.add(origin));
        colors.push(color);
    }
    points.push(end);
    colors.push(color);

    return { commandIndex, colors, segments: points };
};

declare type CreateCircularMoveFunction =
    (commandIndex: number,
     start: Vector3,
     centre: Vector3,
     end: Vector3,
     normal: Vector3,
     sweep: number) => ToolPathSection;
const createCircularMove: CreateCircularMoveFunction = (
    commandIndex: number,
    start: Vector3,
    centre: Vector3,
    end: Vector3,
    normal: Vector3,
    sweep: number,
) => {
    const startPlane = Plane.FromPositionAndNormal(start, normal);
    const distanceAlongNormal = startPlane.signedDistanceTo(centre);
    let centreProjected = centre.subtract(normal.normalize().scale(distanceAlongNormal));
    const distanceBetweenStartAndEndPlane = startPlane.signedDistanceTo(end);

    let pt1 = start;
    let pt2 = start.add(centreProjected.subtract(start).scale(2.0));
    const sections: ToolPathSection[] = [];

    const numberOfSemiCircles = Math.round(sweep / Math.PI);
    const incrementDistanceAlongNormal = distanceBetweenStartAndEndPlane / numberOfSemiCircles;
    pt2 = pt2.add(normal.scale(incrementDistanceAlongNormal));
    centreProjected = centreProjected.add(normal.scale(0.5 * incrementDistanceAlongNormal));
    for (let i = 0; i < numberOfSemiCircles; i++) {
        sections.push(createArcMove(commandIndex, pt1, centreProjected, pt2, normal));

        const temp = pt1;
        pt1 = pt2;
        pt2 = temp;
        centreProjected = centreProjected.add(normal.scale(incrementDistanceAlongNormal));
        pt2 = pt2.add(normal.scale(2.0 * incrementDistanceAlongNormal));
    }

    return sections.reduce((first, second) => ({
        commandIndex: first.commandIndex,
        colors: first.colors.concat(second.colors),
        segments: first.segments.concat(second.segments),
    }));
};

declare type ToolPathExtractFunction = (data: NCProgram) => ToolPathSection[];
const extractToolPath: ToolPathExtractFunction = (data: NCProgram) => {
    const result: ToolPathSection[] = [];
    let lastPos: Vector3 = new Vector3(0, 0, 0);
    let firstPass = true;
    for (let i = 0; i < data.commands.length; i += 1) {
        const command = data.commands[i];
        if (command.name !== 'onRapid'
            && command.name !== 'onLinear'
            && command.name !== 'onCWArc'
            && command.name !== 'onCCWArc'
            && command.name !== 'onCircular') {
            continue;
        }

        const coords = command.args.end as { x: number, y: number, z: number };
        const position = new Vector3(coords.x, coords.y, coords.z);

        if (firstPass) {
            lastPos = position;
            firstPass = false;
        } else if (command.name === 'onRapid') {
            result.push(createRapidMove(i, lastPos, position));
        } else if (command.name === 'onLinear') {
            result.push(createLinearMove(i, lastPos, position));
        } else if (command.name === 'onCWArc' || command.name === 'onCCWArc' || command.name === 'onCircular') {
            const { x, y, z } = command.args.center as { x: number, y: number, z: number };
            const center = new Vector3(x, y, z);

            const coordsNormal = command.args.normal as { x: number, y: number, z: number };
            let normal = new Vector3(coordsNormal.x, coordsNormal.y, coordsNormal.z);

            if (command.name === 'onCWArc') {
                normal = normal.negate();
            }

            if (command.name === 'onCircular') {
                const { sweep } = command.args;
                result.push(
                    createCircularMove(i, lastPos, center, position, normal, sweep as number),
                );
            } else {
                result.push(createArcMove(i, lastPos, center, position, normal));
            }
        }

        lastPos = position;
    }

    return result;
};

export {
    extractGCodeLineData,
    extractNcStreamLineData,
    extractStateData,
    extractFormatLineData,
    extractVariableLineData,
    extractCallStackLineData,
    extractToolPath,
};
