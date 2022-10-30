// import { ProgramBinaryArithmeticOperation, ProgramInvocationOperation, ProgramInvocationTreeOperation, ProgramOperation, ProgramOperationTypes, ReturnOperation } from "../sceneProgram";

// type GNodeOperationMap =
// {
//     [ProgramOperationTypes.BinaryArithmetic]: Pick<ProgramBinaryArithmeticOperation, ''>;
//     [ProgramOperationTypes.Invocation]: Pick<ProgramInvocationOperation, ''>;
//     [ProgramOperationTypes.InvocationTree]: Pick<ProgramInvocationTreeOperation, ''>;
//     [ProgramOperationTypes.Return]: Pick<ReturnOperation, ''>;
// }


// // interface GenericGNodeOperation<O extends ProgramOperationTypes>
// // {
// //     type: O;
// //     blueprint: Partial<ProgramOperation<O>>;
// // }
// // type GNodeOperationMap = { [O in ProgramOperationTypes]: GenericGNodeOperation<O> }

// export type GNodeOperation = GNodeOperationMap[ProgramOperationTypes];