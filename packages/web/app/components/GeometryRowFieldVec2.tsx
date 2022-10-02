import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { DataTypes, FieldRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';
import SlidableInput from './SlideableInput';

const FieldArray = styled.div`

    display: flex;
    flex-direction: column;
    height: 100%;
`;

type Props = RowProps<FieldRowT<DataTypes.Vec2>>;

const GeometryRowFieldVec2 = ({ geometryId, nodeId, row, connected }: Props) =>
{
    const dispatch = useAppDispatch();

    return (
        <GeometryRowDiv
            heightUnits={2}
        >
            {
                connected ? (
                    <GeometryRowNameP
                        align='left'
                    >
                        { row.name }
                    </GeometryRowNameP>
                ) : (
                    <FieldArray>
                        <SlidableInput 
                            value={row.value[0]}
                            onChange={(value, actionToken) => dispatch(geometriesAssignRowData({
                                geometryId: geometryId,
                                nodeId: nodeId,
                                rowId: row.id, 
                                rowData: { value },
                                undo: { actionToken },
                            }))}
                            name={row.name}
                        />
                        <SlidableInput 
                            value={row.value[1]}
                            onChange={(value, actionToken) => dispatch(geometriesAssignRowData({
                                geometryId: geometryId,
                                nodeId: nodeId,
                                rowId: row.id, 
                                rowData: { value },
                                undo: { actionToken },
                            }))}
                            name={row.name}
                        />
                    </FieldArray>
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

export default GeometryRowFieldVec2;