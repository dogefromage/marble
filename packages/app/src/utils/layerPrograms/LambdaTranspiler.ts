import { CompoundStatementNode, ExpressionNode, FunctionCallNode, FunctionNode, IdentifierNode, LambdaExpressionNode, LambdaTypeSpecifierNode, ReturnStatementNode, SimpleTypeSpecifierNode, StatementNode } from "@marble/language";
import { Path, visit } from "@shaderfrog/glsl-parser/ast";
import { Counter } from "../Counter";
import { AstBuilder } from "./AstBuilder";
import ast from "./AstUtils";
import { GeometryContext } from "./GeometryContext";
import ProgramCompiler, { ParamMapping } from "./ProgramCompiler";

interface LambdaDefinition {
    lambdaType: LambdaTypeSpecifierNode;
    lambdaExpression: LambdaExpressionNode;
}

export default class LambdaTranspiler {

    private instanceCounter = new Counter(1e10, 0);
    private definitions = new Map<string, LambdaDefinition>();

    constructor(
        private program: AstBuilder<FunctionNode>,
    ) {}

    public transpileProgram() {
        this.refactorLambdaReturn();
        this.refactorBody();
    }

    private refactorLambdaReturn() {
        let returnType!: LambdaTypeSpecifierNode;
        this.program.edit(node => {
            returnType = AstBuilder.clone(node.prototype.header.returnType.specifier) as LambdaTypeSpecifierNode;
        });

        if (returnType.type !== 'lambda_type_specifier') {
            return;
        }

        const callArgs: string[] = [];
        // add lambda args to function prototype
        this.program.edit(node => {
            let params = node.prototype.parameters;
            if (!params) node.prototype.parameters = params = [];
            let commas = node.prototype.commas;
            if (!commas) node.prototype.commas = commas = [];

            for (let argIndex = 0; argIndex < returnType.args.length; argIndex++) {
                const arg = GeometryContext.getIdentifierName('function_param', argIndex);
                callArgs.push(arg);
                const paramDeclaration = ast.createParameterDeclaration(
                    returnType.args[argIndex],
                    ast.createIdentifier(arg)
                );
                if (params.length) {
                    commas.push(ast.createLiteral(',', ' '));
                }
                params.push(paramDeclaration);
            }
            // change function return type
            returnType.return_type.specifier.whitespace = ' ';
            node.prototype.header.returnType.specifier = returnType.return_type;
        });

        // change return expression
        this.program.edit(node => {
            const returnStmt = node.body.statements[node.body.statements.length - 1] as ReturnStatementNode;
            if (returnStmt?.type !== 'return_statement') {
                throw new Error(`Last statement must be return statement`);
            }
            const returnIdent = AstBuilder.clone(returnStmt.expression) as IdentifierNode;
            if (returnIdent.type !== 'identifier') {
                // debugger
                throw new Error(`Lambda function must return identifier`);
            }
            const callExpr = ast.createFunctionCall(
                ast.createTypeSpecifierNode(returnIdent),
                callArgs.map(arg => ast.createIdentifier(arg)),
            );
            returnStmt.expression = callExpr;
        })
    }

    private refactorBody() {
        let statementIndex = 0;

        this.program.strictMode = false;

        /**
         * Function body statements at index i < statementIndex are lambda free.
         */
        while (true) {
            let statementClone: StatementNode | undefined;
            this.program.edit(node => {
                const statement = node.body.statements[statementIndex];
                if (statement) {
                    statementClone = AstBuilder.clone(statement);
                }
            });
            if (!statementClone) {
                // end of body reached
                break;
            }

            if (statementClone.type === 'declaration_statement' &&
                statementClone.declaration.type === 'declarator_list' &&
                statementClone.declaration.specified_type.specifier.type === 'lambda_type_specifier') {
                // is lambda definition

                const lambdaExpression = statementClone.declaration.declarations[0].initializer as LambdaExpressionNode;
                if (lambdaExpression.type !== 'lambda_expression') {
                    throw new Error(`Lambda declaration was not initialized by lambda expression`);
                }
                const declarationIdentifier = statementClone.declaration.declarations[0].identifier.identifier;
                this.definitions.set(declarationIdentifier, {
                    lambdaExpression,
                    lambdaType: statementClone.declaration.specified_type.specifier,
                });
                // remove stmt
                this.program.edit(node => {
                    node.body.statements.splice(statementIndex, 1);
                });
            } else {
                // other statement

                this.program.edit(funcNode => {
                    const statement = funcNode.body.statements[statementIndex];
                    let hadInvocations = false;

                    this.mapLambdaInvocations(statement, (path, definition) => {
                        hadInvocations = true;
                        const callNode = path.node;
                        const invocResult = this.refactorLambdaInvocation(AstBuilder.clone(callNode), definition);
                        // insert statements
                        funcNode.body.statements.splice(statementIndex, 0, ...invocResult.invocationStatements);
                        // replace node on parent
                        const identifierNode = ast.createIdentifier(invocResult.outputIdentifier);
                        const parentObj = path.parent as any;
                        const key = path.key!;
                        const index = path.index!;
                        if (parentObj[key] === callNode) {
                            parentObj[key] = identifierNode;
                        } else if (parentObj[key][index] === callNode) {
                            parentObj[key][index] = identifierNode;
                        } else {
                            throw new Error(`Could not find child on parent`);
                        }
                    });

                    if (!hadInvocations) {
                        // will eventually be incremented if all invocations are applied
                        statementIndex++;
                    }
                });
            }
        }

        this.program.strictMode = true;
    }

    private mapLambdaInvocations(
        statement: StatementNode, 
        callback: (path: Path<FunctionCallNode>, definition: LambdaDefinition) => void
    ) {
        // @ts-ignore
        visit(statement, {
            function_call: {
                exit: path => {
                    const node = path.node as FunctionCallNode;
                    const identifier = AstBuilder.getFunctionCallIdentifier(node);
                    const definition = this.definitions.get(identifier!);
                    if (!definition) return;
                    callback(path as Path<FunctionCallNode>, definition);
                }
            }
        });
    }

    private refactorLambdaInvocation(callClone: FunctionCallNode, definition: LambdaDefinition) {
        const instanceIndex = this.instanceCounter.increment();
        const instance = structuredClone(definition);

        // declare arguments
        const argumentExpressions = callClone.args
            .filter(arg => arg.type !== 'literal') as ExpressionNode[]; // filter commas
        const paramList = ast.getParameterIdentifiers(instance.lambdaExpression.header.parameters);
        if (argumentExpressions.length !== paramList.length) {
            throw new Error(`Wrong amount of arguments for lambda`);
        }

        const paramMapping: ParamMapping = {};

        const invocationStatements: StatementNode[] = [];

        // lambda parameter expressions
        for (let paramIndex = 0; paramIndex < paramList.length; paramIndex++) {
            // declaration statement
            const [typeSpec, paramIdentifier] = paramList[paramIndex];
            if (!paramIdentifier) {
                throw new Error(`Lambda parameters must be named`);
            }
            const replacementIdentifier = GeometryContext.getIdentifierName('lambda_arg', instanceIndex, paramIdentifier);
            const declarationStatement = ast.createDeclarationStatement(
                ast.createFullySpecifiedType(typeSpec),
                ast.createDeclaration(
                    replacementIdentifier, argumentExpressions[paramIndex]
                )
            );
            invocationStatements.push(declarationStatement);
            paramMapping[paramIdentifier] = { replacementIdentifier };
        }

        const lambdaFunction = this.lambdaExpressionToFunctionNode(instance.lambdaExpression, instance.lambdaType.return_type);
        const lambdaBuilder = new AstBuilder(lambdaFunction, false);
        const outputIdentifier = GeometryContext.getIdentifierName('lambda_out', instanceIndex);

        ProgramCompiler.standardizeBody(
            lambdaBuilder,
            paramMapping,
            `L${instanceIndex}`,
            {
                baseIdentifier: outputIdentifier,
                typeSpecifier: instance.lambdaType.return_type,
                destructure: false,
            },
        );

        lambdaBuilder.destroy();
        const lambdaBodyStmts = (lambdaBuilder.getOriginalRoot().body as CompoundStatementNode).statements;
        invocationStatements.push(...lambdaBodyStmts);

        return { invocationStatements, outputIdentifier };
    }

    private lambdaExpressionToFunctionNode(lambda: LambdaExpressionNode, returnType: SimpleTypeSpecifierNode) {
        let body: CompoundStatementNode;
        if (lambda.body.type === 'compound_statement') {
            body = lambda.body;
        } else {
            body = (
                ast.createCompoundStatement([
                    ast.createReturnStatement(lambda.body),
                ])
            );
        }

        return (
            ast.createFunction(
                ast.createFunctionPrototype(
                    ast.createFunctionHeader(
                        ast.createFullySpecifiedType(returnType),
                        ast.createIdentifier('#lambda_function'),
                    ),
                    lambda.header.parameters,
                ),
                body,
            )
        );
    }
}