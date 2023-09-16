export interface DistanceWeightOptions {
    continuous: number;
    count: number;
    position: number;
    distance: number;
}
export declare class DistanceCalculator {
    private continuous;
    private count;
    private position;
    private distance;
    private options;
    constructor(options?: DistanceWeightOptions);
    private initialize;
    private setContinuous;
    private setCount;
    private setPosition;
    private setDistance;
    private calc;
    get(inputValue: string, comparedValue: string): number;
}
export declare const compareAdaptor: (options?: DistanceWeightOptions) => (inputValue: string, comparedValue: string) => number;
