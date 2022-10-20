import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { IndentRowDiv } from '../styled/IndentRowDiv';
import { DataTypes, FieldRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import { getRowMetadataField } from './GeometryRowField';
import { RowProps } from './GeometryRowRoot';
import SlidableInput from './SlideableInput';

export const FIELD_ROW_LIST_NAMES = [ 'X', 'Y', 'Z' ];

type Props = RowProps<FieldRowT<DataTypes.Vec2 | DataTypes.Vec3>>;

const GeometryRowFieldVecN = ({ geometryId, nodeId, row, connections }: Props) =>
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

    const meta = getRowMetadataField(row);

    return (
        <GeometryRowDiv
            heightUnits={meta.heightUnits}
        >
            <GeometryRowNameP
                align='left'
            >
                { row.name }
            </GeometryRowNameP>
            {
                !connections &&
                row.value.map((value, index) =>
                    <IndentRowDiv
                        key={index}
                    >
                        <SlidableInput
                            value={value}
                            onChange={updateValue(index)}
                            name={FIELD_ROW_LIST_NAMES[ index ]} 
                        />
                    </IndentRowDiv>
                )
            }
            <GeometryJoint 
                geometryId={ geometryId }
                location={{ nodeId, rowId: row.id }}
                direction='input'
                connected={connections > 0}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowFieldVecN;