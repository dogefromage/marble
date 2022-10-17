import produce from 'immer';
import { useMemo } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { GeometryS, ViewProps } from '../types';
import { generateAdjacencyLists } from '../utils/geometries/generateAdjacencyLists';
import zipGeometry from '../utils/geometries/zipGeometry';
import LinkComponent from './GeometryLink';
import GeometryNode from './GeometryNode';

interface Props
{
    viewProps: ViewProps;
    geometryId: string;
}

const GeometryEditorContent = ({ viewProps, geometryId }: Props) =>
{
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
        return generateAdjacencyLists(zipped);

    }, [ zipped?.compilationValidity ]);

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
                    
                    const inputExists = adjacencyLists.backwardsAdjList[nodeIndex]?.[rowIndex] != null;
                    const outputExists = adjacencyLists.forwardsAdjList[nodeIndex]?.[rowIndex]?.length > 0;
                    
                    row.displayConnected = inputExists || outputExists;
                }
            }
        });

    }, [ zipped, adjacencyLists ]);

    const forwardEdges = adjacencyLists?.forwardsAdjList;

    return (
        <>
        {
            forwardEdges && withConnections &&
            Object.values(forwardEdges).map(nodeEdges =>
                Object.values(nodeEdges).map(rowEdges =>
                    rowEdges.map(edge =>
                        <LinkComponent 
                            key={edge.key}
                            geometryId={withConnections.id}
                            edge={edge}
                            fromNode={withConnections.nodes[edge.fromNodeIndex]}
                            toNode={withConnections.nodes[edge.toNodeIndex]}
                        />
                    )
                )
            )
        }
        {
            withConnections &&
            withConnections.nodes.map(node =>
                <GeometryNode
                    geometryId={withConnections.id}
                    key={node.id}
                    node={node}
                    viewProps={viewProps}
                />
            )
        }
        </>
    );
}

export default GeometryEditorContent;