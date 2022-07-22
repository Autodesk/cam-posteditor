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
interface FunctionDefinitions {
    lineNumber: number;
    definition: string;
}

class PostScriptData {
    // String of the source script
    source: string;

    // The source code with out comments and quotated contents
    cleanSource: string;

    // Collection of formats
    formats: string[];

    // Collection of variables
    variables: string[];

    // Collection of functions
    functions: FunctionDefinitions[];

    constructor(postFileContents?: string) {
        this.source = '';
        this.cleanSource = '';
        this.formats = [];
        this.variables = [];
        this.functions = [];

        if (postFileContents) {
            this.parseScript(postFileContents);
        }
    }

    getCleanSource(): string {
        let result: string;
        // Remove all quotation things
        const quotationContentRe = /(".*?"|'.*?')/gs;
        result = this.source.replace(quotationContentRe, '');
        // Remove all multi-line comments
        const multilineCommentRe = /(\/\*(.)*?\*\/)/gs;
        result = result.replace(multilineCommentRe, '');
        // Remove all single-line comments
        const singleCommentRe = /(\/\/.+$)/gm;
        result = result.replace(singleCommentRe, '');
        return result;
    }

    matchPattern(pattern: RegExp, matches: string[]): void {
        // Use clean code
        const stringToMatch = this.cleanSource;
        let matchResult = pattern.exec(stringToMatch);
        while (matchResult) {
            matches.push(matchResult[1]);
            matchResult = pattern.exec(stringToMatch);
        }
    }

    setFunctions(): void {
        // Get list of function definitions. Reversed to make finding correct defintion simpler
        const functionRe = /\s*(function [a-zA-Z0-9]+\(.*\)).+/;
        // Use source since we need to track correcr line number
        this.functions = this.source.split('\n')
            .map((line, lineNumber) => ({
                lineNumber,
                matchResult: functionRe.exec(line),
            })).filter(({ matchResult }) => matchResult != null)
            .map(({ lineNumber, matchResult }) => {
                const functionDef = matchResult ? matchResult[1] : '';
                return { lineNumber, definition: functionDef };
            })
            .reverse();
    }

    parseScript(postFileContents: string): void {
        // Update source
        this.source = postFileContents;
        this.cleanSource = this.getCleanSource();
        // Extract formats
        const formatRe = /\s*var ([a-zA-Z0-9]*)\s*=\s*createFormat/g;
        this.matchPattern(formatRe, this.formats);
        // Extract variables
        const variableRe = /\s*var ([a-zA-Z0-9]*)\s*=\s*createVariable/g;
        this.matchPattern(variableRe, this.variables);
        // Modals as variables
        const modalRe = /\s*var ([a-zA-Z0-9]*)\s*=\s*createModal/g;
        this.matchPattern(modalRe, this.variables);
        // Extract functions
        this.setFunctions();
    }
}

export default PostScriptData;
