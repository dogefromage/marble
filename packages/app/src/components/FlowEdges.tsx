import { FlowEdge, FlowGraph, JointLocation } from '@marble/language';
import React from 'react';
import styled from 'styled-components';
import { Box2, Vector2 } from 'three';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectFlowContext } from '../slices/contextSlice';
import { flowsRemoveEdge, selectSingleFlow } from '../slices/flowsSlice';
import { FlowEditorPanelState, Obj, ObjStrict, ViewTypes } from '../types';
import { getJointLocationKey } from '../utils/flows';

interface SVGProps {
    box: Box2;
}

const FlowEdgesSVG = styled.svg.attrs<SVGProps>(({ box }) => {
    const { min, max } = box;
    const { x, y } = min;
    const w = max.x - x;
    const h = max.y - y;
    return {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${w} ${h}`,
        style: {
            left: `${x}px`,
            top: `${y}px`,
            width: `${w}px`,
            height: `${h}px`,
        }
    };
}) <SVGProps>`
    position: absolute;
    /* outline: solid 1px red; */

    .path-catcher {
        fill: none;
        stroke: transparent;
        /* stroke: #ff000033; */
        stroke-width: 10px;
        cursor: pointer;
    }
    
    .path-display {
        fill: none;
        stroke: black;
        stroke-width: 3px;
        pointer-events: none;
    }

    .path-catcher:hover + .path-display {
        stroke-width: 5px;
    }
`;

interface Props {
    panelId: string;
    flowId: string;
}

const FlowEdges = ({ panelId, flowId }: Props) => {
    const dispatch = useAppDispatch();
    const flow = useAppSelector(selectSingleFlow(flowId));
    const context = useAppSelector(selectFlowContext(flowId));
    const panelState = useAppSelector(selectPanelState(ViewTypes.FlowEditor, panelId));

    const removeEdge = (edgeId: string) => {
        if (!context) return;
        const edge = context.edges[edgeId];
        if (!edge) return;
        dispatch(flowsRemoveEdge({
            flowId,
            input: edge.target,
            undo: { desc: 'Removed an edge from current flow.' },
        }))
    }

    if (!context || !flow || !panelState) {
        return null;
    }

    const { handleQuadruples, svgBox } = generateVectorData(context.edges, flow, panelState);

    return (
        handleQuadruples.length > 0 &&
        <FlowEdgesSVG
            box={svgBox}
        >
            {
                handleQuadruples.map(({ key, points }) => {
                    const [A, B, C, D] = points.map(p => `${p.x},${p.y}`);
                    const d = `M${A} C${B} ${C} ${D}`;

                    return (
                        <React.Fragment
                            key={key}
                        >
                            <path
                                className='path-catcher'
                                d={d}
                                onClick={() => removeEdge(key)}
                                onMouseDown={e => e.stopPropagation()}
                            />
                            <path
                                className='path-display'
                                d={d}
                            />
                        </React.Fragment>
                    );
                })
            }
        </FlowEdgesSVG> 
        || null
    );
}

export default FlowEdges;

function generateVectorData(edges: Obj<FlowEdge>, flow: FlowGraph, panelState: FlowEditorPanelState) {

    const handleEndPoints: Array<{
        key: string;
        A: Vector2;
        D: Vector2;
    }> = [];

    for (const [edgeId, edge] of Object.entries(edges as ObjStrict<FlowEdge>)) {
        const A = getJointPosition(edge.source, panelState, flow);
        const D = getJointPosition(edge.target, panelState, flow);
        if (A && D) {
            handleEndPoints.push({
                key: edgeId, A, D,
            });
        }
    }

    // new edge link
    if (panelState.state.type === 'dragging-link') {
        let A = getJointPosition(panelState.state.fromJoint, panelState, flow);
        const mouseWorld = panelState.state.cursorWorldPosition;
        if (A && mouseWorld) {
            let D = new Vector2(mouseWorld.x, mouseWorld.y);
            if (panelState.state.fromJoint.direction === 'input') {
                const temp = A;
                A = D;
                D = temp;
            }
            handleEndPoints.push({
                key: `NEW_LINK`,
                A, D
            });
        }
    }

    const handleQuadruples = handleEndPoints.map(endPoints => {
        const { key, A, D } = endPoints;
        const dist = A.distanceTo(D);
        const threshold = 200;
        let offset = 0.5 * threshold * Math.atan(dist / threshold);
        // offset = 0; // no squiggly
        const B = new Vector2(+offset, 0).add(A);
        const C = new Vector2(-offset, 0).add(D);
        return { key, points: [ A, B, C, D ] };
    });

    const setOfHandlePoints = handleQuadruples.reduce((set, currQuad) => {
        set.add(currQuad.points[0]);
        set.add(currQuad.points[1]);
        set.add(currQuad.points[2]);
        set.add(currQuad.points[3]);
        return set;
    }, new Set<Vector2>());

    const svgBox = new Box2();
    for (const p of setOfHandlePoints) {
        svgBox.expandByPoint(p.clone().floor());
    }
    svgBox.expandByScalar(10);
    for (const p of setOfHandlePoints) {
        p.sub(svgBox.min);
    }

    return {
        svgBox,
        handleQuadruples,
    }
}

function getJointPosition(jointLocation: JointLocation, panelState: FlowEditorPanelState, flow: FlowGraph) {
    const key = getJointLocationKey(jointLocation);
    const offset = panelState.relativeJointPosition.get(key);
    const node = flow.nodes[jointLocation.nodeId];
    if (!offset || !node) {
        return undefined;
    }
    return new Vector2(
        node.position.x + offset.x,
        node.position.y + offset.y,
    );
}