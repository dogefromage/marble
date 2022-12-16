import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { OutputRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';

const GeometryRowOutput = ({ geometryId, panelId, nodeId, row }: RowProps<OutputRowT>) =>
{
    return (
        <GeometryRowDiv
            heightUnits={1}
        >
            <GeometryRowNameP
                align='right'
            >
                { row.name }
            </GeometryRowNameP>
            <GeometryJoint 
                geometryId={geometryId}
                panelId={panelId}
                location={{ nodeId, rowId: row.id, subIndex: 0 }}
                direction='output'
                connected={row.numConnectedJoints > 0}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowOutput;