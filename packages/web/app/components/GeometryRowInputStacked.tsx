import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { IndentRowDiv } from '../styled/IndentRowDiv';
import { DataTypes, StackedInputRowT } from '../types';
import { arrayRange } from '../utils/array';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';

const MAX_ROWS = 64;

const GeometryRowInputStacked = ({ geometryId, nodeId, row, connections }: RowProps<StackedInputRowT>) =>
{
    // const connections = 5;

    let numberRows = Math.min(MAX_ROWS, connections + 1);
    const indices = arrayRange(numberRows);

    return (<>
        {
            indices.map(index =>
            {
                const connected = index < connections;
                const dataType = connected ? row.dataType : DataTypes.Unknown;
                const rowName = `${row.name} ${index + 1}`

                return (
                    <GeometryRowDiv
                        heightUnits={1}
                    >
                        <IndentRowDiv>
                            <GeometryRowNameP
                                align='left'
                            >
                                { rowName }
                            </GeometryRowNameP>
                        </IndentRowDiv>
                        <GeometryJoint 
                            geometryId={geometryId}
                            location={{ nodeId, rowId: row.id }}
                            direction='input'
                            connected={connected}
                            dataType={row.dataType}
                        />
                    </GeometryRowDiv>
                )
            })
        }
    </>);
}

export default GeometryRowInputStacked;