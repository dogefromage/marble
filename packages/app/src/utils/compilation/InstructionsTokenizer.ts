// import { InstructionTokens } from "../../types";

// const PATTERNS: { [T in InstructionTokens]: RegExp } = 
// {
//     [InstructionTokens.IDENTIFIER_SINGLE]: /[A-z]\w*/, // matches any allowed var name "test"
//     [InstructionTokens.IDENTIFIER_CHAINED]: /[A-z]\w*(\.[A-z]\w*)*/, // matches chained getters "test.xyz"
//     [InstructionTokens.MAKRO]: /#[A-z]\w*/,
//     [InstructionTokens.NUMBER]: /[+-]?\d+(\.\d)?(e[+-]?\d+)?/, // matches any number (hopefully) "+135.13e-10"
//     [InstructionTokens.ASSIGNMENT]: /=|\+=|-=|\*=|\/=|%=|\|=/,
//     [InstructionTokens.LEFT_B]: /\(/,
//     [InstructionTokens.RIGHT_B]: /\)/,
//     [InstructionTokens.OPERATOR]: /[+\-*/<>%&^|]|\+\+|--|<=|>=|==|!=|&&|^^|\|\||<<|>>|/,
//     [InstructionTokens.SEMI]: /;/,
// }

// const DELIMITER = /\s+/;

// export default class InstructionsTokenizer
// {
//     private sourceStack: string[]; 

//     constructor(
//         source: string,
//     ) {
//         this.sourceStack = source.split(DELIMITER);
//     }

//     /**
//      * Returns true iff the next token exists and is of type if specified.
//      */
//     public hasNextToken(type?: InstructionTokens) 
//     {
//         if (this.sourceStack.length === 0) 
//             return false; // no more tokens

//         if (type == null) 
//             return true; // has any next token

//         const pattern = PATTERNS[type];
//         if (!pattern) 
//             throw new Error(`Pattern for token type ${type} doesn't exist`);

//         const token = this.sourceStack[0];
        
//         const match = this.matchStart(token, pattern);
//         return match != null;
//     }

//     /**
//      * Returns token if it is of specified type, null otherwise
//      * Increments read index
//      */
//     public popNextToken(type?: InstructionTokens) {        
//         if (this.hasNextToken(type)) {
//             return this.sourceStack.shift();
//         }
//     }

//     private matchStart(txt: string, regex: RegExp) {

//         const match = txt.match(regex);
//         if (match?.index != 0) return;
//         return match;
//     }
// }