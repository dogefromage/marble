import { useEffect } from "react";
import { selectPanelState } from "../enhancers/panelStateEnhancer";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { geometryEditorPanelsSetNewLink } from "../slices/panelGeometryEditorSlice";
import { GeometryNewLink, GeometryS, GNodeS, GNodeT, PlanarCamera, ViewTypes } from "../types";
import countHeightUnits from "../utils/geometries/countHeightUnits";
import getJointPosition from "../utils/geometries/getJointPosition";
import { pointScreenToWorld } from "../utils/geometries/planarCameraMath";
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
    const debouncedTrigger = useDebouncedValue(newLink, 150, undefined);
    console.log(debouncedTrigger);
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

    const endLocation = newLink.endJointTransfer.location;
    const rowIndex = template.rows.findIndex(r => r.id == endLocation.rowId);

    const endJointHeight = countHeightUnits(template.rows, node, rowIndex, endLocation.subIndex);
    const endJointPos = getJointPosition(node.position, endJointHeight, newLink.endJointTransfer.direction);

    const offsetPosVec = p2v(newLink.offsetPos);
    const worldCursor = pointScreenToWorld(cam, offsetPosVec);
    const worldPoint = v2p(worldCursor);

    return (
        <GeometryLinkDiv 
            A={endJointPos}
            B={worldPoint}
            dataType={newLink.endJointTransfer.dataType}
        />
    );
}

export default GeometryLinkNew;