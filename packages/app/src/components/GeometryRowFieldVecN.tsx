
// export const FIELD_ROW_LIST_NAMES = [ 'X', 'Y', 'Z' ];

// type Props = RowProps<FieldRowT<'vec2' | 'vec3'>>;

// const GeometryRowFieldVecN = ({ geometryId, panelId, nodeId, row }: Props) => {
//     const dispatch = useAppDispatch();

//     const updateValue = (index: number) =>
//         (value: number, actionToken: string | undefined) => {
//             const combinedValue = [...row.value] as typeof row.value;
//             combinedValue[index] = value;

//             dispatch(geometriesAssignRowData({
//                 geometryId: geometryId,
//                 nodeId: nodeId,
//                 rowId: row.id,
//                 rowData: { value: combinedValue },
//                 undo: { actionToken, desc: `Updated row field value.` },
//             }));
//         }

//     const meta = getRowMetadataField({
//         state: row,
//         template: row,
//         numConnectedJoints: row.numConnectedJoints,
//     });

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
//                 !isConnected &&
//                 row.value.map((value, index) =>
//                     <IndentRowDiv
//                         key={index}
//                     >
//                         <SlidableInput
//                             value={value}
//                             onChange={updateValue(index)}
//                             name={FIELD_ROW_LIST_NAMES[index]}
//                         />
//                     </IndentRowDiv>
//                 )
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

// export default GeometryRowFieldVecN;