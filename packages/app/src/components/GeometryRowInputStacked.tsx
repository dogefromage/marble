import React from 'react';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { RowMetadata, StackedInputRowT } from '../types';
import { arrayRange } from '../utils/arrays';
import GeometryJoint from './GeometryJoint';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';

const MAX_ROWS = 64;

export function getRowMetadataStackedInput(props: RowMetaProps<StackedInputRowT>): RowMetadata {
    const heightUnits = Math.min(MAX_ROWS, props.numConnectedJoints + 1);
    return rowMeta({ heightUnits });
}

const GeometryRowInputStacked = ({ geometryId, panelId, nodeId, row }: RowProps<StackedInputRowT>) => {
    const numConnectedJoints = row.incomingElements?.length || 0;
    const rowMeta = getRowMetadataStackedInput({ state: row, template: row, numConnectedJoints, })
    const heightUnits = rowMeta.heightUnits;
    const indices = arrayRange(heightUnits);

    return (<>
        {
            indices.map(subIndex => {
                const isConnected = subIndex < heightUnits - 1;
                const rowName = `${row.name} ${subIndex + 1}`

                return (
                    <GeometryRowDiv
                        heightUnits={1}
                        key={`subrow-${subIndex}`}
                    >
                        <GeometryRowNameP
                            align='left'
                        >
                            {rowName}
                        </GeometryRowNameP>
                        <GeometryJoint
                            geometryId={geometryId}
                            jointLocation={{ nodeId, rowId: row.id, subIndex }}
                            jointDirection='input'
                            connected={isConnected}
                            dataType={row.dataType}
                            additional={!isConnected}
                            isStackedInput={true}
                        />
                    </GeometryRowDiv>
                )
            })
        }
    </>);
}

export default GeometryRowInputStacked;