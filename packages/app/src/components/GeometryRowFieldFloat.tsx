
// type Props = RowProps<FieldRowT<'float'>>;

// const GeometryRowFieldFloat = ({ geometryId, nodeId, row }: Props) =>
// {
//     const dispatch = useAppDispatch();
//     const isConnected = row.numConnectedJoints > 0;

//     return (
//         <FlowRowDiv
//             heightUnits={1}
//         >
//             {
//                 isConnected ? (
//                     <GeometryRowNameP
//                         align='left'
//                     >
//                         { row.name }
//                     </GeometryRowNameP>
//                 ) : (
//                     <SlidableInput 
//                         value={row.value}
//                         onChange={(value, actionToken) => dispatch(geometriesAssignRowData({
//                             geometryId: geometryId,
//                             nodeId: nodeId,
//                             rowId: row.id, 
//                             rowData: { value },
//                             undo: { actionToken, desc: `Updated row field value.` },
//                         }))}
//                         name={row.name}
//                     />
//                 )
//             }
//             <GeometryInputJoint 
//                 geometryId={geometryId}
//                 row={row}
//                 jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
//             />
//         </FlowRowDiv>
//     );
// }

// export default GeometryRowFieldFloat;