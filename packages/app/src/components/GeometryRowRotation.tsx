
// export function getRowMetadataRotation(props: RowMetaProps<RotationRowT>): RowMetadata {
//     let heightUnits = 1;

//     if (props.numConnectedJoints === 0) {
//         if (props.state?.currentDisplay) {
//             if (props.state.currentDisplay.rotationModel === 'xyzw')
//                 heightUnits += 5; // xyzw
//             else
//                 heightUnits += 4; // xyz
//         }
//     }

//     return rowMeta({ 
//         heightUnits, 
//         dynamicValue: true,
//     });
// }

// type Props = RowProps<RotationRowT>;

// export const FIELD_ROW_LIST_NAMES = [ 'X', 'Y', 'Z', 'W' ];

// const GeometryRowRotation = ({ geometryId, panelId, nodeId, row }: Props) => {
//     const dispatch = useAppDispatch();
//     const rowRotationModel = row.rotationModel || 'xyz';

//     useEffect(() => {
//         if (row.currentDisplay && row.currentDisplay.rotationModel === rowRotationModel)
//             return; // all set

//         // must (re)compute row.currentDisplay

//         const rotationMatrix = mat3.fromValues(...row.value);
//         const q = quat.fromMat3(quat.create(), rotationMatrix);

//         let newDisplayValues: number[];

//         if (rowRotationModel === 'xyzw') {
//             newDisplayValues = [ ...q ];
//         }
//         else {
//             newDisplayValues = [ ...quaternionToEuler(q) ];
//         }

//         const rowS: Partial<RowS<RotationRowT>> = {
//             currentDisplay: {
//                 rotationModel: rowRotationModel,
//                 displayValues: newDisplayValues,
//             }
//         }

//         const doNotRecord = row.currentDisplay == null;

//         dispatch(geometriesAssignRowData({
//             geometryId,
//             nodeId,
//             rowId: row.id,
//             rowData: rowS,
//             undo: { doNotRecord, desc: `Updated rotation row values.` },
//         }));
//     }, [ rowRotationModel, row.currentDisplay ]);

//     const updateValue = (index: number) =>
//         (value: number, actionToken: string | undefined) => {
//             if (!row.currentDisplay) return;

//             const newDisplayValues = row.currentDisplay.displayValues.slice();
//             newDisplayValues[ index ] = value;

//             let rotationMatrix = mat3.create();

//             if (row.currentDisplay.rotationModel === 'xyzw') {
//                 const q = quat.normalize(quat.create(), newDisplayValues as quat);
//                 mat3.fromQuat(rotationMatrix, q);
//             }
//             else {
//                 rotationMatrix = eulerToMat3(newDisplayValues, row.currentDisplay.rotationModel);
//             }

//             const rowS: Partial<RowS<RotationRowT>> = {
//                 currentDisplay: {
//                     rotationModel: rowRotationModel,
//                     displayValues: newDisplayValues,
//                 },
//                 value: [ ...rotationMatrix ] as Tuple<number, 9>,
//             }

//             dispatch(geometriesAssignRowData({
//                 geometryId: geometryId,
//                 nodeId: nodeId,
//                 rowId: row.id,
//                 rowData: rowS,
//                 undo: { actionToken, desc: `Updated rotation row values.` },
//             }));
//         }

//     const switchRotationModel = (newModel: RotationModels) => {
//         const rowS: Partial<RowS<RotationRowT>> = {
//             rotationModel: newModel,
//         }
//         dispatch(geometriesAssignRowData({
//             geometryId: geometryId,
//             nodeId: nodeId,
//             rowId: row.id,
//             rowData: rowS,
//             undo: { desc: `Switched rotation model of row.` },
//         }));
//     }

//     const meta = getRowMetadataRotation({
//         state: row, template: row,
//         numConnectedJoints: row.numConnectedJoints,
//     });
//     const metric = rowRotationModel == 'xyzw' ? undefined : Metrics.Angle;

//     const isConnected = row.numConnectedJoints > 0;

//     return (
//         <FlowRowDiv
//             heightUnits={meta.heightUnits}
//         >
//             <GeometryRowNameP
//                 align='left'
//             >
//                 {row.name}
//             </GeometryRowNameP>
//             {
//                 !isConnected && row.currentDisplay && <>
//                 {
//                     <IndentRowDiv>
//                         <GeometrySelectOptionSubRow
//                             value={rowRotationModel}
//                             onChange={(newModel: string) => {
//                                 switchRotationModel(newModel as RotationModels);
//                             }}
//                             options={Object.keys(rotationModelNames) as RotationModels[]}
//                             mapName={rotationModelNames}
//                         />
//                     </IndentRowDiv>
//                 }{
//                     row.currentDisplay.displayValues.map((value, index) =>
//                         <IndentRowDiv
//                             key={index}
//                         >
//                             <SlidableInput
//                                 value={value}
//                                 onChange={updateValue(index)}
//                                 name={FIELD_ROW_LIST_NAMES[ index ]}
//                                 metric={metric}
//                             />
//                         </IndentRowDiv>
//                     )
//                 }
//                 </>
//             }
//             <FlowJoint
//                 flowId={geometryId}
//                 jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
//                 jointDirection='input'
//                 connected={isConnected}
//                 dataType={row.dataType}
//             />
//         </FlowRowDiv>
//     );
// }

// export default GeometryRowRotation;

export {};
