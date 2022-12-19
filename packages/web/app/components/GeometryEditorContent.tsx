import React, { useEffect, useMemo } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesRemoveIncomingElements, selectGeometry } from '../slices/geometriesSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { GeometryJointLocation, PlanarCamera, SelectionStatus, ViewTypes } from '../types';
import generateGeometryConnectionData from '../utils/geometries/generateGeometryConnectionData';
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
        try {
            return generateGeometryConnectionData(geometry, templates);
        } catch (e) {
            console.error(e);
            return;
        }
    }, [ geometry?.id, geometry?.compilationValidity ]);

    useEffect(() =>
    {
        if (!connectionData) return;
        if (connectionData.strayConnectedJoints.length)
        {
            dispatch(geometriesRemoveIncomingElements({
                geometryId,
                joints: connectionData.strayConnectedJoints,
                undo: { doNotRecord: true },
            }));
        }
    }, [ connectionData ]);

    if (!connectionData) return null;

    const { forwardEdges, templateMap, connectedRows, nodeHeights } = connectionData;

    // New link
    const newLink = panelState?.newLink;
    const newLinkNode = geometry?.nodes.find(node => node.id === newLink?.location.nodeId);
    const newLinkTemplate = connectionData.templateMap.get(newLinkNode?.id!);

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

                        const fromNodeTemplate = templateMap.get(fromNodeState.id)!;
                        const toNodeTemplate =   templateMap.get(toNodeState.id)!;

                        const fromRowHeights = connectionData.rowHeights.get(fromNodeState.id)!;
                        const toRowHeights =   connectionData.rowHeights.get(toNodeState.id)!;
                        
                        const fromHeightUnits = fromRowHeights[ edge.fromIndices[1] ];
                        const toHeightUnits = toRowHeights[ edge.toIndices[1] ] + edge.toIndices[2]; // add subindex
                                                
                        const joints: GeometryJointLocation[] = 
                        [
                            {
                                nodeId: fromNodeState.id,
                                rowId: fromNodeTemplate.rows[edge.fromIndices[1]].id,
                                subIndex: 0,
                            },
                            {
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
            newLink && newLinkNode && newLinkTemplate &&
            <GeometryLinkNew
                panelId={panelId}
                newLink={newLink}
                node={newLinkNode}
                template={newLinkTemplate}
                getCamera={getCamera}
            /> 
        }{
            geometry &&
            geometry.nodes.map(node =>
            {
                let selectionStatus = SelectionStatus.Nothing;
                if (geometry.selectedNodes.includes(node.id))
                    selectionStatus = SelectionStatus.Selected;

                return (
                    <GeometryNode
                        geometryId={geometry.id}
                        panelId={panelId}
                        key={node.id}
                        nodeState={node}
                        nodeTemplate={templateMap.get(node.id)!}
                        connectedRows={connectedRows.get(node.id)!}
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