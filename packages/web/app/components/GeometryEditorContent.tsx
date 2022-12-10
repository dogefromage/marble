import produce from 'immer';
import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesDisconnectJoints, selectGeometries } from '../slices/geometriesSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { GeometryS, PlanarCamera, ViewProps } from '../types';
import { generateAdjacencyLists } from '../utils/geometries/generateAdjacencyLists';
import zipGeometry from '../utils/geometries/zipGeometry';
import LinkComponent from './GeometryLink';
import GeometryLinkNew from './GeometryLinkNew';
import GeometryNode from './GeometryNode';

interface Props
{
    panelId: string;
    geometryId: string;
    getCamera: () => PlanarCamera | undefined;
}

const GeometryEditorContent = ({ panelId, geometryId, getCamera }: Props) =>
{
    const dispatch = useAppDispatch();
    const geometryS: GeometryS | undefined = useAppSelector(selectGeometries)[geometryId];
    const { templates } = useAppSelector(selectTemplates);

    const zipped = useMemo(() =>
    {
        if (!geometryS || !templates)
            return;

        try
        {
            return zipGeometry(geometryS, templates);
        }
        catch { }

    }, [ geometryS, templates ]);

    const adjacencyLists = useMemo(() =>
    {
        if (!zipped) return;
        const adjList = generateAdjacencyLists(zipped);
        return adjList;
    }, [ zipped?.compilationValidity ]);

    useEffect(() =>
    {
        if (!adjacencyLists) return;

        if (adjacencyLists.strayConnectedJoints.length)
        {
            dispatch(geometriesDisconnectJoints({
                geometryId,
                joints: adjacencyLists.strayConnectedJoints,
                undo: { doNotRecord: true },
            }));
        }
    }, [ adjacencyLists ]);

    const withConnections = useMemo(() =>
    {
        if (!zipped || !adjacencyLists) 
            return;

        return produce(zipped, z =>
        {
            for (let nodeIndex = 0; nodeIndex < z.nodes.length; nodeIndex++)
            {
                const node = z.nodes[nodeIndex];

                for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++)
                {
                    const row = node.rows[rowIndex];
                    
                    const outputExists = adjacencyLists.forwardsAdjList[nodeIndex]?.[rowIndex]?.length > 0;
                    row.displayConnected = outputExists;
                }
            }
        });
    }, [ zipped, adjacencyLists ]);

    return (
        <>
        {
            adjacencyLists?.forwardsAdjList && withConnections &&
            Object.values(adjacencyLists?.forwardsAdjList).map(edgesOfNode =>
                Object.values(edgesOfNode).map(edgesOfRow =>
                    edgesOfRow.map(edge =>
                        <LinkComponent 
                            key={edge.id}
                            geometryId={withConnections.id}
                            edge={edge}
                            fromNode={withConnections.nodes[edge.fromIndices[0]]}
                            toNode={withConnections.nodes[edge.toIndices[0]]}
                        />
                    )
                )
            )
        }
        {
            withConnections &&
            <GeometryLinkNew
                panelId={panelId}
                geometry={withConnections}
            />
        }
        {
            withConnections &&
            withConnections.nodes.map(node =>
                <GeometryNode
                    geometryId={withConnections.id}
                    key={node.id}
                    node={node}
                    panelId={panelId}
                    getCamera={getCamera}
                />
            )
        }
        </>
    );
}

export default React.memo(GeometryEditorContent);