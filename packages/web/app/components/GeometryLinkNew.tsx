import { useEffect } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useAppDispatch } from "../redux/hooks";
import { geometryEditorPanelsSetNewLink } from "../slices/panelGeometryEditorSlice";
import { GeometryNewLink, GNodeS, GNodeT, PlanarCamera } from "../types";
import getJointPosition from "../utils/geometries/getJointPosition";
import { pointScreenToWorld } from "../utils/geometries/planarCameraMath";
import { countHeightUnits } from "../utils/geometries/rowHeights";
import { p2v, v2p } from "../utils/linalg";
import GeometryLinkDiv from "./GeometryLinkDiv";

interface Props
{
    panelId: string;
    newLink: GeometryNewLink;
    node: GNodeS;
    template: GNodeT;
    getCamera: () => PlanarCamera | undefined;
}

const GeometryLinkNew = ({ panelId, newLink, node, template, getCamera }: Props) =>
{
    const dispatch = useAppDispatch();
    
    // delete old link
    const debouncedTrigger = useDebouncedValue(newLink, 200, undefined);
    useEffect(() =>
    {
        if (!debouncedTrigger) return;
        dispatch(geometryEditorPanelsSetNewLink({
            panelId,
            newLink: null,
        }))
    }, [ debouncedTrigger ]);

    const cam = getCamera();
    if (!cam) return null;

    const endLocation = newLink.location;
    const rowIndex = template.rows.findIndex(r => r.id == endLocation.rowId);

    const endJointHeight = countHeightUnits(template.rows, node, rowIndex, endLocation.subIndex);
    const endJointPos = getJointPosition(node.position, endJointHeight, newLink.direction);

    const offsetPosVec = p2v(newLink.offsetPos);
    const worldCursor = pointScreenToWorld(cam, offsetPosVec);
    const worldPoint = v2p(worldCursor);

    return (
        <GeometryLinkDiv 
            A={endJointPos}
            B={worldPoint}
            dataType={newLink.dataType}
        />
    );
}

export default GeometryLinkNew;