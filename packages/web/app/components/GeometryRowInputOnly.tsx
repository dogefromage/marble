import { InputOnlyRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';

const GeometryRowInputOnly = ({ geometryId, nodeId, row, connections }: RowProps<InputOnlyRowT>) =>
{
    return (
        <GeometryRowDiv
            heightUnits={1}
        >
            <GeometryRowNameP
                align='left'
            >
                { row.name }
            </GeometryRowNameP>
            <GeometryJoint 
                geometryId={geometryId}
                location={{ nodeId, rowId: row.id }}
                direction='input'
                connected={connections > 0}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowInputOnly;