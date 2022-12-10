import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesDisconnectJoints, selectGeometries } from '../slices/geometriesSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { GeometryS, PlanarCamera, ViewTypes } from '../types';
import generateGeometryConnectionData from '../utils/geometries/generateGeometryConnectionData';
import LinkComponent from './GeometryLink';
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
    const geometry: GeometryS | undefined = useAppSelector(selectGeometries)[ geometryId ];
    const { templates } = useAppSelector(selectTemplates);
    const panelState = useSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));

    const connectionData = useMemo(() =>
    {
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

    return (
        <>
        {
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
            // withConnections &&
            // <GeometryLinkNew
            //     panelId={panelId}
            //     geometry={withConnections}
            // /> 
        }{
            geometry.nodes.map(node =>
                <GeometryNode
                    geometryId={geometry.id}
                    panelId={panelId}
                    key={node.id}
                    nodeState={node}
                    nodeTemplate={templateMap.get(node.id)!}
                    connectedRows={connectedRows.get(node.id)!}
                    getCamera={getCamera}
                    isActive={panelState?.activeNode === node.id}
                />
            )
        }
        </>
    );
}

export default React.memo(GeometryEditorContent);