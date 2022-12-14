import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { DataTypes, FieldRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';
import SlidableInput from './SlideableInput';

type Props = RowProps<FieldRowT<DataTypes.Float>>;

const GeometryRowFieldFloat = ({ geometryId, panelId, nodeId, row }: Props) =>
{
    const dispatch = useAppDispatch();

    return (
        <GeometryRowDiv
            heightUnits={1}
        >
            {
                row.isConnected ? (
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
                panelId={panelId}
                location={{ nodeId, rowId: row.id, subIndex: 0 }}
                direction='input'
                connected={row.isConnected}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowFieldFloat;