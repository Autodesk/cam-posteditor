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
