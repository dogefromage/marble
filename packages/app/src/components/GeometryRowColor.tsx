
// const SplitColorDiv = styled.div`
//     width: 100%;
//     display: grid;
//     grid-template-columns: 1fr 50px;
// `;

// export function getRowMetadataColor({ numConnectedJoints }: RowMetaProps<ColorRowT>): RowMetadata {
//     return rowMeta({ heightUnits: 1, dynamicValue: true });
// }


// const GeometryRowColor = ({ geometryId, panelId, nodeId, row }: RowProps<ColorRowT>) => {
//     const dispatch = useAppDispatch();
//     const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));


//     const onColorChanged = (newColor: ColorTuple, actionToken: string) => {
//         dispatch(geometriesAssignRowData({
//             geometryId: geometryId,
//             nodeId: nodeId,
//             rowId: row.id,
//             rowData: { value: newColor },
//             undo: { actionToken, desc: `Updated value of color row in active geometry.` },
//         }));
//     }

//     const meta = getRowMetadataColor({ 
//         state: row, template: 
//         row, numConnectedJoints: 
//         row.numConnectedJoints 
//     });

//     if (!panelState) return null;

//     return (
//         <FlowRowDiv heightUnits={meta.heightUnits}>
//             <SplitColorDiv>
//                 <GeometryRowNameP align='left'>
//                     {row.name}
//                 </GeometryRowNameP> { 
//                     row.numConnectedJoints === 0 &&
//                     <FormColorPicker value={row.value} onChange={onColorChanged}/>
//                 }
//             </SplitColorDiv>
//             <GeometryInputJoint
//                 geometryId={geometryId}
//                 jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
//                 row={row}
//             />
//         </FlowRowDiv>
//     );
// }

// export default GeometryRowColor;