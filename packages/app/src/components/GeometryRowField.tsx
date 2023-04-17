
// export function getRowMetadataField(props: RowMetaProps<FieldRowT>): RowMetadata {
//     if (props.numConnectedJoints === 0) {
//         if (props.template.dataType === 'vec2') {
//             return rowMeta({ dynamicValue: true, heightUnits: 3 });
//         }
//         if (props.template.dataType === 'vec3') {
//             return rowMeta({ dynamicValue: true, heightUnits: 4 });
//         }
//     }
//     return rowMeta({ dynamicValue: true });
// }

// const GeometryRowField = (props: RowProps<FieldRowT>) => {
//     if (props.row.dataType === 'float')
//         return <GeometryRowFieldFloat {...props as RowProps<FieldRowT<'float'>>} />;

//     if (props.row.dataType === 'vec2' ||
//         props.row.dataType === 'vec3')
//         return <GeometryRowFieldVecN {...props as RowProps<FieldRowT<'vec2' | 'vec3'>>} />;

//     console.error('row component missing');
//     return null;
// }

// export default GeometryRowField;