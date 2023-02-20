import { AstNode, IdentifierNode, DeclarationNode, ParameterDeclarationNode, FunctionNode, FunctionCallNode } from './node';

type SymbolNode = IdentifierNode | DeclarationNode | ParameterDeclarationNode | FunctionCallNode; // add more if needed

export interface SymbolRow<N extends SymbolNode | FunctionNode> {
    initializer: N;
    references: (N | SymbolNode)[];
}

export type SymbolTable<N extends SymbolNode | FunctionNode> = { [name: string]: SymbolRow<N> }; 

export type Scope = {
    name: string;
    parent?: Scope;
    bindings: SymbolTable<SymbolNode>;
    functions: SymbolTable<FunctionNode>;
    types: SymbolTable; // unused
}
export interface Program {
    type: 'program';
    program: AstNode[];
    scopes: Scope[];
    wsStart?: string;
    wsEnd?: string;
}