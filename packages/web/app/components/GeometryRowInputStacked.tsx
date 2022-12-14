import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { IndentRowDiv } from '../styled/IndentRowDiv';
import { StackedInputRowT } from '../types';
import { arrayRange } from '../utils/array';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';

const MAX_ROWS = 64;

const GeometryRowInputStacked = ({ geometryId, panelId, nodeId, row: row }: RowProps<StackedInputRowT>) =>
{
    // const connections = 5;
    const connections = row.connectedOutputs.length;

    let numberRows = Math.min(MAX_ROWS, connections + 1);
    const indices = arrayRange(numberRows);

    return (<>
        {
            indices.map(subIndex =>
            {
                const connected = subIndex < connections;
                const rowName = `${row.name} ${subIndex + 1}`

                return (
                    <GeometryRowDiv
                        heightUnits={1}
                        key={`subrow-${subIndex}`}
                    >
                        <GeometryRowNameP
                            align='left'
                        >
                            { rowName }
                        </GeometryRowNameP>
                        <GeometryJoint 
                            geometryId={geometryId}
                            panelId={panelId}
                            location={{ nodeId, rowId: row.id, subIndex }}
                            direction='input'
                            connected={connected}
                            dataType={row.dataType}
                            additional={!connected}
                            isStackedInput={true}
                        />
                    </GeometryRowDiv>
                )
            })
        }
    </>);
}

export default GeometryRowInputStacked;