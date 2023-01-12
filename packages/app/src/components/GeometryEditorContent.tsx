import React, { useEffect, useMemo } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesRemoveIncomingElements, selectGeometry } from '../slices/geometriesSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { GeometryJointLocation, PlanarCamera, SelectionStatus, ViewTypes } from '../types';
import generateGeometryData from '../utils/geometries/generateGeometryData';
import LinkComponent from './GeometryLink';
import GeometryLinkNew from './GeometryLinkNew';
import GeometryNode from './GeometryNode';

interface Props
{
    panelId: string;
    geometryId: string;
    getCamera: () => PlanarCamera | undefined;
}

const GeometryEditorContent = ({ geometryId, panelId, getCamera }: Props) =>
{
    const dispatch = useAppDispatch();
    const geometry = useAppSelector(selectGeometry(geometryId));
    const { templates } = useAppSelector(selectTemplates);
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));

    const connectionData = useMemo(() =>
    {
        if (!geometry || !Object.values(templates).length) return;
        const connectionData = generateGeometryData(geometry, templates);

        if (connectionData.strayConnectedJoints.length) {
            dispatch(geometriesRemoveIncomingElements({
                geometryId,
                joints: connectionData.strayConnectedJoints,
                undo: { doNotRecord: true },
            }));
        }

        return connectionData;

    }, [ dispatch, geometry?.id, geometry?.compilationValidity ]);

    if (!connectionData) return null;

    const { forwardEdges, nodeDatas } = connectionData;

    // New link
    const newLink = panelState?.newLink;
    const newLinkNodeIndex = geometry?.nodes.findIndex(node => node.id === newLink?.location.nodeId);
    const newLinkNode = geometry?.nodes[newLinkNodeIndex!];
    const newLinkData = connectionData.nodeDatas[newLinkNodeIndex!];

    return (
        <>
        {
            geometry &&
            Object.values(forwardEdges).map(edgesOfNode =>
                Object.values(edgesOfNode).map(edgesOfRow =>
                    edgesOfRow.map(edge =>
                    {
                        const fromNodeState = geometry.nodes[ edge.fromIndices[0] ];
                        const toNodeState =   geometry.nodes[ edge.toIndices[0] ];
                        // should be defined, since edge also is
                        const fromData = nodeDatas[edge.fromIndices[0]]!;
                        const toData = nodeDatas[edge.toIndices[0]]!;
                        const fromNodeTemplate = fromData.template;
                        const toNodeTemplate = toData.template;

                        if (!fromNodeTemplate || !toNodeTemplate) {
                            console.warn('these templates should exist');
                        }

                        const fromHeightUnits = fromData.rowHeights[ edge.fromIndices[1] ];
                        const toHeightUnits = toData.rowHeights[ edge.toIndices[1] ] + edge.toIndices[2]; // add subindex
                                                
                        const joints: GeometryJointLocation[] = [ 
                            {
                                nodeId: fromNodeState.id,
                                rowId: fromNodeTemplate.rows[edge.fromIndices[1]].id,
                                subIndex: 0,
                            }, {
                                nodeId: toNodeState.id,
                                rowId: toNodeTemplate.rows[edge.toIndices[1]].id,
                                subIndex: edge.toIndices[2],
                            },
                        ];

                        return (
                            <LinkComponent
                                key={edge.id}
                                geometryId={geometry.id}
                                edge={edge}
                                fromPosition={fromNodeState.position}
                                fromHeightUnits={fromHeightUnits}
                                toPosition={toNodeState.position}
                                toHeightUnits={toHeightUnits}
                                joints={joints}
                            />
                        );
                    })
                )
            )
        }{
            newLink && newLinkNode && newLinkData &&
            <GeometryLinkNew
                panelId={panelId}
                newLink={newLink}
                node={newLinkNode}
                nodeData={newLinkData}
                getCamera={getCamera}
            />
        }{
            geometry &&
            geometry.nodes.map((node, nodeIndex) =>
            {
                let selectionStatus = SelectionStatus.Nothing;
                if (geometry.selectedNodes.includes(node.id)) {
                    selectionStatus = SelectionStatus.Selected;
                }
                const nodeData = nodeDatas[nodeIndex];

                return (
                    <GeometryNode
                        key={node.id}
                        geometryId={geometry.id}
                        panelId={panelId}
                        nodeState={node}
                        nodeData={nodeData}
                        getCamera={getCamera}
                        selectionStatus={selectionStatus}
                    />
                );
            })
        }
        </>
    );
}

export default React.memo(GeometryEditorContent);