/**
 * 生成唯一标识工具
 */
export declare class UniqueIdentity {
    private readonly LowercaseLetters;
    private readonly CapitalLetters;
    private readonly NumericalConstants;
    private readonly SpecialSymbols;
    /**
     * 生成获得随机数因子
     */
    private toRandomSeed;
    /**
     * 生成随机的唯一标识
     * @param length
     * @returns
     */
    private generateByRandom;
    /**
     * 生成指定格式的唯一标识，使用U/u作为占位符
     * @param format
     * @returns
     */
    private generateByFormat;
    /**
     * 生成唯一标识
     */
    generate(format?: string): string;
    generate(length?: number): string;
    /**
     * 随机获取唯一标识
     */
    generateRandom(): string;
}
