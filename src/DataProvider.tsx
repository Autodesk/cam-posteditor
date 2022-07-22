import React, {
    useState, useMemo, useEffect, useCallback,
} from 'react';
import DataContext from './DataContext';
import {
    GCodeLineData,
    NCStreamLineData,
    OnGCodeLineClickHandler,
    OnNCStreamLineClickHandler,
    DataContextInterface,
    FormatLineData,
    VariableLineData,
    VariableData,
    VariableState,
    OnVariableLineClickHandler,
    CallStackData,
    OnCallStackLineClickHandler,
    CallStackLineData,
    ToolPathSection,
} from './types';
import NCProgram from './nc-parser/nc-program';
import {
    extractGCodeLineData,
    extractNcStreamLineData,
    extractFormatLineData,
    extractVariableLineData,
    extractStateData,
    extractCallStackLineData,
    extractToolPath,
} from './util/data-converter';
import {
    getSourceCode,
    getOutputFile,
} from './util/fetch-data';
import PostScriptData from './post-parser/post-script-data';

interface DataProviderProps {
    children: React.ReactElement
}

const DataProvider: React.FC<DataProviderProps> = ({ children }: DataProviderProps) => {
    const [data, setData] = useState<NCProgram>(new NCProgram());
    const [postScriptData, setPostScriptData] = useState<PostScriptData>(new PostScriptData());
    const [selectedCommandLine, setSelectedCommandLine] = useState<number>(0);
    const [selectedGCodeLine, setSelectedGCodeLine] = useState<number | null>(null);
    const [selectedCallStack, setSelectedCallStack] = useState<CallStackData | null>(null);
    const [selectedCallStackLine, setSelectedCallStackLine] = useState<number | null>(null);
    const [selectedPostFileLine, setSelectedPostFileLine] = useState<number | null>(null);
    const [ncStreamCommands, setNcStreamCommands] = useState<NCStreamLineData[]>([]);
    const [gCodeCommands, setGCodeCommands] = useState<GCodeLineData[]>([]);
    const [formatCommands, setFormatCommands] = useState<FormatLineData[]>([]);
    const [variableCommands, setVariableCommands] = useState<VariableLineData[]>([]);
    const [variableStates, setVariableStates] = useState<VariableData[]>([]);
    const [currentState, setCurrentState] = useState<VariableState[]>([]);
    const [relevantVariables, setRelevantVariables] = useState<string[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
    const [callStacks, setCallStacks] = useState<CallStackData[]>([]);
    const [postFilename] = useState<string>('./fanuc.cps');
    const [postFileContents, setPostFileContents] = useState<string>('');
    const [toolPathData, setToolPathData] = useState<ToolPathSection[]>([]);

    const loadMainData = async () => {
        const responseText:string = await getOutputFile();
        setData(new NCProgram(responseText));
    };

    const getPostFile = async () => {
        const responseText:string = await getSourceCode();
        setPostFileContents(responseText);
        setPostScriptData(new PostScriptData(responseText));
    };

    useEffect(() => {
        // Disabled for now, not yet a final implementation, should probably show a
        // warning to the user
        // eslint-disable-next-line no-console
        loadMainData().catch((e) => console.error('Failed to load main data: ', e));
        getPostFile().catch(() => {
            setPostFileContents('Failed to load file');
            setPostScriptData(new PostScriptData());
        });
    }, []);

    const updateState = useCallback((
        commandNumber: number,
        invocationNumber: number,
        eventNumber: number,
    ) => {
        const states: VariableState[] = [];
        const variables: string[] = [];
        variableStates.map((variable) => {
            // Previous change event in same command and invocation
            let group = variable.events.filter(
                (event) => event.commandLineNumber === commandNumber
                    && event.invocationNumber === invocationNumber,
            ).filter(
                (event) => event.eventNumber < eventNumber,
            );

            if (group.length > 0) {
                variables.push(variable.name);
            } else {
                // Last change event in previous invocation
                group = variable.events.filter(
                    (event) => event.commandLineNumber === commandNumber
                        && event.invocationNumber < invocationNumber,
                );
                if (group.length === 0) {
                    // Last change event in previous command
                    group = variable.events.filter(
                        (event) => event.commandLineNumber < commandNumber,
                    );
                }
            }
            if (group.length > 0) {
                states.push({
                    name: variable.name,
                    ...group[group.length - 1],
                });
            }
            return true;
        });
        setCurrentState(states);
        setRelevantVariables(variables);
    }, [variableStates]);

    const handleGCodeLineClicked: OnGCodeLineClickHandler = useCallback(
        (eventData: GCodeLineData): void => {
            if (selectedCommandLine !== eventData.commandLineNumber) {
                setSelectedCommandLine(eventData.commandLineNumber);
            }

            setSelectedGCodeLine(eventData.gCodeLineNumber);

            const callStack = callStacks.find(
                (cs) => cs.commandLineNumber === eventData.commandLineNumber
                    && cs.eventNumber === eventData.eventNumber,
            );
            setSelectedCallStack(callStack ?? null);
            setSelectedCallStackLine(callStack?.callStackData[0]?.stackFrameNumber ?? null);
            setSelectedPostFileLine(callStack?.callStackData[0]?.lineNumber ?? null);

            // Update current state and relevant variables
            updateState(
                eventData.commandLineNumber,
                eventData.invocationNumber,
                eventData.eventNumber,
            );
            setSelectedVariable(null);
        },
        [selectedCommandLine, callStacks, updateState],
    );

    const handleNCStreamLineClicked: OnNCStreamLineClickHandler = useCallback(
        (eventData: NCStreamLineData): void => {
            setSelectedCommandLine(eventData.commandLineNumber);
            const callStack = callStacks.find(
                (cs) => cs.commandLineNumber === eventData.commandLineNumber,
            );
            setSelectedGCodeLine(null);
            setSelectedCallStack(null);
            setSelectedCallStackLine(null);
            setSelectedPostFileLine(null);
            if (callStack != null) {
                // Update current state and relevant variables
                updateState(
                    callStack.commandLineNumber,
                    callStack.invocationNumber,
                    callStack.eventNumber,
                );
            }
            setSelectedVariable(null);
        },
        [callStacks, updateState],
    );

    const handleCallStackLineClicked: OnCallStackLineClickHandler = (
        eventData: CallStackLineData,
    ): void => {
        setSelectedCallStackLine(eventData.stackFrameNumber);
        setSelectedPostFileLine(eventData.lineNumber);
    };

    const handleVariableLineClicked: OnVariableLineClickHandler = useCallback((
        eventData: VariableState,
    ): void => {
        const callStack = callStacks.find(
            (cs) => cs.commandLineNumber === eventData.commandLineNumber
                && cs.invocationNumber === eventData.invocationNumber
                && cs.eventNumber === eventData.eventNumber,
        );
        setSelectedCallStack(callStack ?? null);
        setSelectedCallStackLine(callStack?.callStackData[0]?.stackFrameNumber ?? null);
        setSelectedPostFileLine(callStack?.callStackData[0]?.lineNumber ?? null);
        setSelectedVariable(eventData.name);

        // Unselect the gcode line
        setSelectedGCodeLine(null);
    }, [callStacks]);

    const contextData: DataContextInterface = useMemo(() => ({
        ncStreamCommands,
        gCodeCommands,
        formatCommands,
        variableCommands,
        variableStates,
        currentState,
        callStacks,
        relevantVariables,
        selectedVariable,
        selectedCommandLine,
        selectedGCodeLine,
        selectedCallStack,
        selectedCallStackLine,
        selectedPostFileLine,
        handleGCodeLineClicked,
        handleNCStreamLineClicked,
        handleCallStackLineClicked,
        handleVariableLineClicked,
        postFilename,
        postFileContents,
        toolPathData,
    }), [
        ncStreamCommands,
        gCodeCommands,
        formatCommands,
        variableCommands,
        variableStates,
        selectedCommandLine,
        selectedGCodeLine,
        currentState,
        callStacks,
        relevantVariables,
        selectedVariable,
        selectedCallStack,
        selectedCallStackLine,
        selectedPostFileLine,
        handleGCodeLineClicked,
        handleNCStreamLineClicked,
        handleVariableLineClicked,
        postFilename,
        postFileContents,
        toolPathData,
    ]);

    useEffect(() => {
        setNcStreamCommands(extractNcStreamLineData(data));
        setGCodeCommands(extractGCodeLineData(data));
        setFormatCommands(extractFormatLineData(postScriptData));
        setVariableCommands(extractVariableLineData(postScriptData));
        setVariableStates(extractStateData(data));
        setCallStacks(extractCallStackLineData(data, postScriptData));
        setToolPathData(extractToolPath(data));

        // Reset control variables
        setSelectedCommandLine(0);
        setCurrentState([]);
        setRelevantVariables([]);
        setSelectedCallStackLine(null);
    }, [data, postScriptData]);

    return (
        <DataContext.Provider value={contextData}>
            {children}
        </DataContext.Provider>
    );
};

export default DataProvider;
