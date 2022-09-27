

export class CodeTemplate
{
    constructor(
        private templateCode: string
    ) {}

    replace(searchValue: string, replacementValue: string)
    {
        if (!this.templateCode.includes(searchValue))
            throw new Error(`Search value "${searchValue}" is not in template code`);

        this.templateCode = this.templateCode
            .replace(searchValue, replacementValue);
    }

    getFinishedCode(templateTester?: RegExp)
    {
        if (templateTester && templateTester.test(this.templateCode))
            throw new Error(`Generated code contains templates`);

        return this.templateCode;
    }
}