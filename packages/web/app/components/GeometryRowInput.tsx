import { InputRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';

const GeometryRowInput = ({ geometryId, nodeId, row, connected }: RowProps<InputRowT>) =>
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
                connected={connected}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowInput;