import { AstNode, CompoundStatementNode, FunctionCallNode, FunctionNode, IdentifierNode, LambdaTypeSpecifierNode, ParameterDeclarationNode, Program, Scope, SimpleTypeSpecifierNode, StatementNode, SymbolNode, SymbolRow, SymbolTable, TypeSpecifierNode } from "@marble/language";
import { Path, visit } from "@shaderfrog/glsl-parser/ast";
import ast from "./AstUtils";

class ProgramBuilder {

    public createEmptyProgram() {
        const program: Program = {
            type: 'program',
            program: [],
            scopes: []
        };
        this.addScope(program, 'global');
        return program;
    }

    public addStatementToCompound(
        compound: CompoundStatementNode, nearestScope: Scope, statement: StatementNode, 
        addBefore?: StatementNode, declarations?: SymbolTable<SymbolNode>
    ) {
        let statementIndex = compound.statements.length;
        if (addBefore) {
            statementIndex = compound.statements.indexOf(addBefore);
            if (statementIndex < 0) {
                throw new Error(`Add before statement is not a statement of function`);
            }
        }
        compound.statements = [
            ...compound.statements.slice(0, statementIndex),
            statement,
            ...compound.statements.slice(statementIndex),
        ];
        if (declarations) {
            for (const [ identifier, binding ] of Object.entries(declarations)) {
                this.declareBinding(nearestScope.bindings, binding);
            }
        }
    }
    public spliceStatement(compound: CompoundStatementNode, statement: StatementNode) {
        // STATEMENT
        const list = compound.statements;
        const index = list.indexOf(statement);
        if (index < 0) {
            throw new Error(`Statement not in function`);
        }
        list.splice(index, 1);
    }
    public removeReferencesOfSubtree(program: Program, subtree: AstNode) {
        const enterReferenceNode = { 
            enter: (path: Path<SymbolNode>) => {
                this.removeNodeReference(program, path.node);
            }
        }
        // @ts-ignore
        visit(subtree, {
            identifier:            enterReferenceNode,
            declaration:           enterReferenceNode,
            parameter_declaration: enterReferenceNode,
        });
    }

    public createFunction(program: Program, returnType: TypeSpecifierNode | LambdaTypeSpecifierNode, name: string) {
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
        program.program.push(functionNode);
        const globalScope = this.getGlobalScope(program.scopes[0]);
        if (globalScope.functions[name]) {
            throw new Error(`Function "${name}" already defined in global scope`);
        }
        globalScope.functions[name] = { references: [ functionNode ], initializer: functionNode }
        const functionScope = this.addScope(program, name, globalScope);
        return { functionNode, functionScope };
    }
    public addFunctionParameter(func: FunctionNode, funcScope: Scope, paramDecl: ParameterDeclarationNode, identifier: string) {
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
    public removeNodeReference(program: Program, reference: SymbolNode) {
        const row = this.findReferenceSymbolRow(program, reference);
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
    public findReferenceSymbolRow(program: Program, reference: SymbolNode) {
        const { identifier } = this.getSymbolNodeIdentifier(reference);
        for (const scope of program.scopes) {
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
    public getSymbolNodeIdentifier(node: SymbolNode): IdentifierNode {
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
            case 'function_call':
                const typeSpec = node.identifier as SimpleTypeSpecifierNode;
                if (typeSpec.specifier.type !== 'identifier') {
                    throw new Error(`Keyword node cannot be referenced`);
                }
                return typeSpec.specifier;
        }
        throw new Error(`No identifier found in node of type "${node.type}"`);
    }
    public getFunctionCallIdentifier(call: FunctionCallNode) {
        const callIdentifier = call.identifier as any;
        const identifier: string | undefined =
            callIdentifier.specifier?.identifier ||
            callIdentifier.identifier ||
            callIdentifier.keyword;
        return identifier;
    }

    public addScope(program: Program, name: string, parent?: Scope) {
        const scope: Scope = {
            name, parent, bindings: {}, types: {}, functions: {},
        }
        program.scopes.push(scope);
        return scope;
    }
    public getGlobalScope(descendant: Scope) {
        while (descendant.parent) {
            descendant = descendant.parent;
        }
        return descendant;
    }
    public getFunctionScope(program: Program, functionNode: FunctionNode) {
        const scope = program.scopes
            .find(scope => scope.name === functionNode.prototype.header.name.identifier);
        if (!scope) {
            throw new Error(`Function scope not found`);
        }
        return scope;
    }
    public getDescendandScopes(program: Program, ancestor: Scope) {
        const descendants = new Set<Scope>();
        for (const scope of program.scopes) {
            for (let s = scope; s != null; s = s.parent!) {
                if (s.parent === ancestor || descendants.has(s.parent!)) {
                    descendants.add(scope);
                    break;
                }
            }
        }
        return [ ...descendants ];
    }
    public findFirstFunction(program: Program) {
        const func = program.program.find(node => node.type === 'function') as FunctionNode;
        if (!func) {
            throw new Error(`No function in program`);
        }
        return func;
    }
}

const builder = new ProgramBuilder();
export default builder;