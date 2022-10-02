import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { DataTypes, FieldRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import { getRowHeightFields } from './GeometryRowField';
import { RowProps } from './GeometryRowRoot';
import SlidableInput from './SlideableInput';

const IndentFieldRowDiv = styled.div`
    padding-left: 0.5rem;
`;

export const FIELD_ROW_LIST_NAMES = [ 'X', 'Y', 'Z' ];

type Props = RowProps<FieldRowT<DataTypes.Vec2 | DataTypes.Vec3>>;

const GeometryRowFieldVecN = ({ geometryId, nodeId, row, connected }: Props) =>
{
    const dispatch = useAppDispatch();

    const updateValue = (index: number) => 
        (value: number, actionToken: string | undefined) =>
    {
        const combinedValue = row.value.slice();
        combinedValue[index] = value;

        dispatch(geometriesAssignRowData({
            geometryId: geometryId,
            nodeId: nodeId,
            rowId: row.id, 
            rowData: { value: combinedValue },
            undo: { actionToken },
        }));
    }

    const rowHeight = getRowHeightFields(row);

    return (
        <GeometryRowDiv
            heightUnits={rowHeight}
        >
            <GeometryRowNameP
                align='left'
            >
                { row.name }
            </GeometryRowNameP>
            {
                !connected &&
                row.value.map((value, index) =>
                    <IndentFieldRowDiv
                        key={index}
                    >
                        <SlidableInput
                            value={value}
                            onChange={updateValue(index)}
                            name={FIELD_ROW_LIST_NAMES[ index ]} 
                        />
                    </IndentFieldRowDiv>
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

export default GeometryRowFieldVecN;