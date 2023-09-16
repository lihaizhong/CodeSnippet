export interface YouNeedSuggestionOptions {
    keyNameList: string | string[];
    filterEmptyValue: boolean;
    caseSensitive: boolean;
    minSimilarity: number;
    compare: (sourceStr: string, targetStr: string) => number;
}
export interface YouNeedSuggestResult<T> {
    data: T;
    similarity: number;
}
export declare class YouNeedSuggestion<T> {
    private keyNameList;
    private dataSource;
    private options;
    constructor(dataSource: T[], options: Partial<YouNeedSuggestionOptions>);
    private parseValue;
    private parseKeyNameList;
    private getMaxSimilarity;
    get(val: string): YouNeedSuggestResult<T>[];
}
