import React from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppSelector } from '../redux/hooks';
import { selectSingleGeometry } from '../slices/geometriesSlice';
import { selectSingleGeometryData } from '../slices/geometryDatasSlice';
import { GeometryJointLocation, PlanarCamera, SelectionStatus } from '../types';
import { ViewTypes } from '../types/panelManager/views';
import getJointPositionWorld from '../utils/geometries/geometryUtils';
import { TEST_USER_ID } from '../utils/testSetup';
import LinkComponent from './GeometryLink';
import GeometryLinkNew from './GeometryLinkNew';
import GeometryNode from './GeometryNode';

interface Props {
    panelId: string;
    geometryId: string;
    getCamera: () => PlanarCamera | undefined;
}

const GeometryEditorContent = ({ geometryId, panelId, getCamera }: Props) => {
    const geometry = useAppSelector(selectSingleGeometry(geometryId));
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));
    const connectionData = useAppSelector(selectSingleGeometryData(geometryId));

    if (!geometry) return <p>Missing geometry</p>;
    
    if (!geometry ||
        connectionData == null 
        || connectionData.geometryVersion < geometry?.version
        ) return <p>No geometry data</p>;

    const { forwardEdges, nodeDatas } = connectionData;

    // New link
    const newLink = panelState?.newLink;
    const newLinkNodeIndex = geometry?.nodes.findIndex(node => node.id === newLink?.location.nodeId);
    const newLinkNode = geometry?.nodes[newLinkNodeIndex!];
    const newLinkData = connectionData.nodeDatas[newLinkNodeIndex!];

    return (
        <>
        {
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

                        const A = getJointPositionWorld(
                            fromNodeState.position, 
                            fromData.rowHeights[ edge.fromIndices[1] ], 
                            fromData.widthPixels, 'output'
                        );
                        const B = getJointPositionWorld(
                            toNodeState.position, 
                            toData.rowHeights[ edge.toIndices[1] ] + edge.toIndices[2],
                            toData.widthPixels, 'input'
                        );
                                                
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
                                posA={A}
                                posB={B}
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
            geometry.nodes.map((node, nodeIndex) => {
                let selectionStatus = SelectionStatus.Nothing;

                for (const [ userId, selection ] of Object.entries(geometry.selections)) {
                    if (selection!.includes(node.id)) {
                        selectionStatus = userId === TEST_USER_ID ?
                            SelectionStatus.Selected : SelectionStatus.SelectedForeign;
                    }
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