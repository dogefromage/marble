import { AstNode, FunctionNode, LambdaTypeSpecifierNode, ParameterDeclarationNode, Program, Scope, StatementNode, SymbolNode, SymbolRow, SymbolTable, TypeSpecifierNode } from "@marble/language";
import { Path, visit } from "@shaderfrog/glsl-parser/ast";
import ast from "./AstUtils";

export default class ProgramBuilder {

    public program: Program;
    private globalScope?: Scope;

    constructor(program?: Program) {
        if (program) {
            this.program = program;
        } else {
            this.program = {
                type: 'program',
                program: [],
                scopes: []
            };
            this.addScope('global');
        }
    }

    public addFunctionStatement(
        functionNode: FunctionNode, statement: StatementNode, 
        addBefore?: StatementNode, declarations?: SymbolTable<SymbolNode>
    ) {
        const functionScope = this.getFunctionScope(functionNode);
        if (!functionScope) {
            throw new Error(`Function scope not found in program`);
        }
        const { body } = functionNode;
        let statementIndex = body.statements.length;
        if (addBefore) {
            statementIndex = body.statements.indexOf(addBefore);
            if (statementIndex < 0) {
                throw new Error(`Add before statement is not a statement of function`);
            }
        }
        body.statements = [
            ...body.statements.slice(0, statementIndex),
            statement,
            ...body.statements.slice(statementIndex),
        ];
        if (declarations) {
            for (const [ identifier, binding ] of Object.entries(declarations)) {
                this.declareBinding(functionScope.bindings, binding);
            }
        }
    }
    public spliceFunctionStatement(functionNode: FunctionNode, statement: StatementNode) {
        // STATEMENT
        const list = functionNode.body.statements;
        const index = list.indexOf(statement);
        if (index < 0) {
            throw new Error(`Statement not in function`);
        }
        list.splice(index, 1);
    }
    public removeReferencesOfSubtree(subtree: AstNode) {
        const enterReferenceNode = { 
            enter: (path: Path<SymbolNode>) => {
                this.removeNodeReference(path.node);
            }
        }
        // @ts-ignore
        visit(subtree, {
            identifier:            enterReferenceNode,
            declaration:           enterReferenceNode,
            parameter_declaration: enterReferenceNode,
        });
    }


    public createFunction(returnType: TypeSpecifierNode | LambdaTypeSpecifierNode, name: string) {
        const functionNode = (
            ast.createFunction(
                ast.createFunctionPrototype(
                    ast.createFunctionHeader(
                        ast.createFullySpecifiedType(
                            returnType as TypeSpecifierNode
                        ),
                        ast.createIdentifier(
                            name
                        )
                    ), []
                ),
                ast.createCompoundStatement([])
            )
        );
        this.program.program.push(functionNode);
        const globalScope = this.getGlobalScope();
        if (globalScope.functions[name]) {
            throw new Error(`Function "${name}" already defined in global scope`);
        }
        globalScope.functions[name] = { references: [ functionNode ], initializer: functionNode }
        const functionScope = this.addScope(name, globalScope);
        return { functionNode, functionScope };
    }
    public getFunctionSymbols() {
        const functions = this.getGlobalScope().functions;
        return Object.keys(functions);
    }
    public getFunctionSymbolByIdentifier(symbolIdentifier: string) {
        const functions = this.getGlobalScope().functions;
        const row = functions[symbolIdentifier]
        if (!row) {
            throw new Error(`Function with symbol "${symbolIdentifier}" not found`);
        }
        return row;
    }
    public addFunctionParameter(func: FunctionNode, paramDecl: ParameterDeclarationNode, identifier: string) {
        const funcScope = this.getFunctionScope(func);
        const params = func.prototype.parameters || (func.prototype.parameters = [])
        params.push(paramDecl);
        this.declareBinding(funcScope.bindings, { initializer: paramDecl, references: [ paramDecl ] })
    }

    
    public declareBinding(table: SymbolTable<SymbolNode>, binding: SymbolRow<SymbolNode>) {
        const { identifier } = this.getSymbolNodeIdentifier(binding.initializer!);
        if (table[identifier]) {
            throw new Error(`Symbol "${identifier}" already defined in table`);
        }
        table[identifier] = binding;
    }
    public addNodeReference(scope: Scope, reference: SymbolNode) {
        const { identifier } = this.getSymbolNodeIdentifier(reference);
        const symbol = this.findSymbolOfScopeBranch(scope, identifier);
        if (!symbol) {
            throw new Error(`Symbol for "${identifier}" was not found in scope "${scope.name}" or its descendants`);
        }
        if (symbol.references.includes(reference)) {
            return;
        }
        symbol.references.push(reference);
    }
    public removeNodeReference(reference: SymbolNode) {
        const row = this.findReferenceSymbolRow(reference);
        if (!row) {
            return false;
        }
        if (row.initializer === reference) {
            throw new Error(`Cannot remove initializer from binding`);
        }
        row.references = row.references.filter(node => node !== reference);
    }
    public findSymbolOfScopeBranch(scope: Scope, identifier: string): SymbolRow<SymbolNode> | null {
        if (scope.bindings[identifier]) {
            return scope.bindings[identifier];
        }
        if (scope.parent) {
            return this.findSymbolOfScopeBranch(scope.parent, identifier);
        }
        return null;
    }
    public findReferenceSymbolRow(reference: SymbolNode) {
        const { identifier } = this.getSymbolNodeIdentifier(reference);
        for (const scope of this.program.scopes) {
            const table = scope.bindings[identifier];
            if (table?.references.includes(reference)) {
                return table;
            }
        }
    }
    public mergeAndRenameReferences(targetRow: SymbolRow<SymbolNode>, references: SymbolNode[]) {
        if (!targetRow.initializer) {
            throw new Error(`No initializer found on targetRow`);
        }
        const { identifier } = this.getSymbolNodeIdentifier(targetRow.initializer);
        this.renameReferences(references, identifier);
        targetRow.references = [ ...new Set([ ...targetRow.references, ...references ]) ]; // join w.o. duplicates
    }
    public renameReferences(references: SymbolNode[], targetIdentifier: string) {
        for (const reference of references) {
            const identifier = this.getSymbolNodeIdentifier(reference);
            identifier.identifier = targetIdentifier;
        }
    }


    public addScope(name: string, parent?: Scope) {
        const scope: Scope = {
            name, parent, bindings: {}, types: {}, functions: {},
        }
        this.program.scopes.push(scope);
        return scope;
    }
    // public removeScope(scope: Scope) {
    //     this.program.scopes = this.program.scopes
    //         .filter(s => s !== scope);
    // }
    public getGlobalScope() {
        if (!this.globalScope) {
            if (this.program.scopes.length === 0) {
                throw new Error(`No scopes in program`);
            }
            this.globalScope = this.program.scopes[0];
            while (this.globalScope!.parent) {
                this.globalScope = this.globalScope.parent;
            }
        }
        return this.globalScope;
    }
    public getFunctionScope(functionNode: FunctionNode) {
        const scope = this.program.scopes
            .find(scope => scope.name === functionNode.prototype.header.name.identifier);
        if (!scope) {
            throw new Error(`Function scope not found`);
        }
        return scope;
    }
    public findScopeByName(name: string) {
        return this.program.scopes.find(scope => scope.name === name);
    }
    public getDescendandScopes(ancestor: Scope) {
        const descendants = new Set<Scope>();
        for (const scope of this.program.scopes) {
            for (let s = scope; s != null; s = s.parent!) {
                if (s.parent === ancestor || descendants.has(s.parent!)) {
                    descendants.add(scope);
                    break;
                }
            }
        }
        return [ ...descendants ];
    }
    // public isDescendantScope(descendant: Scope, ancestor: Scope) {
    //     while (descendant.parent) {
    //         if (descendant.parent === ancestor) {
    //             return true;
    //         }
    //         descendant = descendant.parent;
    //     }
    //     return false;
    // }


    private getSymbolNodeIdentifier(node: SymbolNode) {
        switch (node.type) {
            case 'identifier':
                return node;
            case 'declaration':
                return node.identifier;
            case 'parameter_declaration':
                if (node.declaration.type !== 'parameter_declarator') {
                    break;
                }
                return node.declaration.identifier;
        }
        throw new Error(`No identifier found in node of type "${node.type}"`);
    }
}