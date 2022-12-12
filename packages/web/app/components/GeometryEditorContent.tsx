import React, { useEffect, useMemo } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesDisconnectJoints, selectGeometry } from '../slices/geometriesSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { PlanarCamera, SelectionStatus, ViewTypes } from '../types';
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
            dispatch(geometriesDisconnectJoints({
                geometryId,
                joints: connectionData.strayConnectedJoints,
                undo: { doNotRecord: true },
            }));
        }
    }, [ connectionData ]);

    if (!connectionData) return null;

    const { forwardEdges, templateMap, connectedRows } = connectionData;

    // New link
    const newLink = panelState?.newLink;
    const newLinkNode = geometry?.nodes.find(node => node.id === newLink?.endJointTransfer.location.nodeId);
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
                        const fromNodeTemplate = templateMap.get(fromNodeState.id)!;
                        const toNodeState = geometry.nodes[ edge.toIndices[0] ];
                        const toNodeTemplate = templateMap.get(toNodeState.id)!;

                        return (
                            <LinkComponent
                                key={edge.id}
                                geometryId={geometry.id}
                                edge={edge}
                                fromNodeTemplate={fromNodeTemplate}
                                fromNodeState={fromNodeState}
                                toNodeTemplate={toNodeTemplate}
                                toNodeState={toNodeState}
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
                // if (geometry.activeNode === node.id)
                //     selectionStatus = SelectionStatus.Active;

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