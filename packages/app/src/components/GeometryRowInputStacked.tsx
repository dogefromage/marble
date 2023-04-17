
// const MAX_ROWS = 64;

// export function getRowMetadataStackedInput(props: RowMetaProps<StackedInputRowT>): RowMetadata {
//     const heightUnits = Math.min(MAX_ROWS, props.numConnectedJoints + 1);
//     return rowMeta({ heightUnits });
// }

// const GeometryRowInputStacked = ({ geometryId, panelId, nodeId, row }: RowProps<StackedInputRowT>) => {
//     const numConnectedJoints = row.incomingElements?.length || 0;
//     const rowMeta = getRowMetadataStackedInput({ state: row, template: row, numConnectedJoints, })
//     const heightUnits = rowMeta.heightUnits;
//     const indices = arrayRange(heightUnits);

//     return (<>
//         {
//             indices.map(subIndex => {
//                 const isConnected = subIndex < heightUnits - 1;
//                 const rowName = `${row.name} ${subIndex + 1}`

//                 return (
//                     <FlowRowDiv
//                         heightUnits={1}
//                         key={`subrow-${subIndex}`}
//                     >
//                         <GeometryRowNameP
//                             align='left'
//                         >
//                             {rowName}
//                         </GeometryRowNameP>
//                         <FlowJoint
//                             flowId={geometryId}
//                             jointLocation={{ nodeId, rowId: row.id, subIndex }}
//                             jointDirection='input'
//                             connected={isConnected}
//                             dataType={row.dataType}
//                             additional={!isConnected}
//                             isStackedInput={true}
//                         />
//                     </FlowRowDiv>
//                 )
//             })
//         }
//     </>);
// }

// export default GeometryRowInputStacked;

export {};
