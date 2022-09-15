import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import { FloatFieldRowT } from '../types/Geometry';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';
import SlidableInput from './SlideableInput';
import GeometryRowDiv from './styled/GeometryRowDiv';
import GeometryRowNameP from './styled/GeometryRowNameP';

const GeometryRowFieldFloat = ({ geometryId, nodeId, row, connected }: RowProps<FloatFieldRowT>) =>
{
    const dispatch = useAppDispatch();

    return (
        <GeometryRowDiv
            heightUnits={1}
        >
            {
                connected ? (
                    <GeometryRowNameP
                        align='left'
                    >
                        { row.name }
                    </GeometryRowNameP>
                ) : (
                    <SlidableInput 
                        value={row.value}
                        onChange={(value, actionToken) => dispatch(geometriesAssignRowData({
                            geometryId: geometryId,
                            nodeId: nodeId,
                            rowId: row.id, 
                            rowData: { value },
                            undo: { actionToken },
                        }))}
                        name={row.name}
                    />
                )
            }
            <GeometryJoint 
                geometryId={ geometryId }
                location={{ nodeId, rowId: row.id }}
                direction='input'
                connected={connected}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowFieldFloat;