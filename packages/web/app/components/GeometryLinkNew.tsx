import { GeometryZ, ViewProps } from '../types';

interface Props
{
    panelId: string;
    geometry: GeometryZ;
}

const GeometryLinkNew = ({ panelId, geometry }: Props) =>
{
    return null;

    // const { newLink, camera } = useSelector(selectPanelState(ViewTypes.GeometryEditor, viewProps.panelId));

    // const dispatch = useAppDispatch();
    
    // const debouncedTrigger = useDebouncedValue(newLink, 100);
    // useEffect(() =>
    // {
    //     if (!debouncedTrigger) return;
    //     dispatch(geometryEditorPanelSetNewLink({
    //         panelId: viewProps.panelId,
    //         newLink: null,
    //     }))
    // }, [ debouncedTrigger ]);

    // if (!newLink) return null;

    // const endLocation = newLink.endJointTransfer.location;
    // const endNode = geometry.nodes.find(n => n.id == endLocation.nodeId);
    // if (!endNode) return null;
    // const rowIndex = endNode.rows.findIndex(r => r.id == endLocation.rowId);

    // const endJointHeight = countHeightUnits(endNode.rows, rowIndex, endLocation.subIndex);
    // const endJointPos = getJointPosition(endNode.position, endJointHeight, newLink.endJointTransfer.direction);

    // const offsetPosVec = p2v(newLink.offsetPos);
    // const worldCursor = pointScreenToWorld(camera, offsetPosVec);
    // const worldPoint = v2p(worldCursor);

    // return (
    //     <GeometryLinkDiv 
    //         A={endJointPos}
    //         B={worldPoint}
    //         dataType={newLink.endJointTransfer.dataType}
    //     />
    // );
}

export default GeometryLinkNew;