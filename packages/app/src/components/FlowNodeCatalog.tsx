import React, { useMemo } from 'react';
import { Vec2 } from 'three';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { flowsAddNode } from '../slices/flowsSlice';
import { selectSingleMenu } from '../slices/menusSlice';
import { flowEditorSetStateNeutral } from '../slices/panelFlowEditorSlice';
import { selectFlowContext } from '../slices/contextSlice';
import { FloatingMenuShape, FlowEditorActionState, MenuElement, ObjStrict, SearchMenuElement, TitleMenuElement, ViewTypes } from '../types';
import MenuRootFloating from './MenuRootFloating';
import { FlowSignature, FlowSignatureId } from '@marble/language';

function isCatalogOpen(
    state: FlowEditorActionState
): state is FlowEditorActionState & ({ type: 'add-node-at-position' } | { type: 'add-node-with-connection' }) {
    return state.type === 'add-node-at-position' || state.type === 'add-node-with-connection'
}

const SEARCH_ELEMENT_KEY = 'search';

interface Props {
    panelId: string;
}

const FlowNodeCatalog = ({ panelId }: Props) => {
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.FlowEditor, panelId));
    const flowId = panelState?.flowStack[0];
    const graphValidation = useAppSelector(selectFlowContext(flowId!));

    const menuId = `template-catalog:${flowId}`;
    const menuState = useAppSelector(selectSingleMenu(menuId));
    const searchValue: string = menuState?.state.get(SEARCH_ELEMENT_KEY) ?? '';

    const addNode = (signatureId: FlowSignatureId, position: Vec2) => {
        if (!flowId) return;
        dispatch(flowsAddNode({
            flowId,
            signatureId: signatureId,
            position,
            undo: { desc: `Added new node to active flow.` }
        }));
    }
    
    const catalogState = panelState && isCatalogOpen(panelState.state) && panelState.state || undefined;

    const environmentSignatures = useMemo(() => {
        const signatureObj = graphValidation?.flowEnvironment.getAvailableSignatures();
        if (signatureObj) {
            return Array.from(Object.values(signatureObj)) as FlowSignature[];
        }
    }, [ graphValidation?.flowEnvironment ])

    const menuShape = useMemo(() => {
        if (!catalogState || !environmentSignatures) return;
        const title: TitleMenuElement = {
            type: 'title',
            key: 'title',
            name: 'Add Template',
            color: 'black',
        }
        const searchBar: SearchMenuElement = {
            key: SEARCH_ELEMENT_KEY,
            type: 'search',
            name: 'search',
            placeholder: 'Search...',
            autofocus: true,
        };

        if (searchValue.length > 0) {
            // render filtered
            const filtered = environmentSignatures
                .filter(t => t.name.toLowerCase().includes(searchValue.toLowerCase()));

            const listTemplates: MenuElement[] = filtered.map(signature => ({
                type: 'button',
                key: signature.id,
                name: signature.name,
                onClick: () => addNode(signature.id, catalogState.location.worldPosition),
            }));

            const menuShape: FloatingMenuShape = {
                type: 'floating',
                list: [
                    title,
                    searchBar,
                    ...listTemplates,
                ],
            }
            return menuShape;
        } else {
            // render grouped
            const groupedTemplatesMap = environmentSignatures
                .reduce((groupes, current) => {
                    const key = current!.attributes?.category || 'Other';
                    if (groupes[key] == null) { groupes[key] = []; }
                    groupes[key]!.push(current!);
                    return groupes;
                }, {} as ObjStrict<FlowSignature[]>);

            const sortedGroupes = Object.entries(groupedTemplatesMap)
                .sort(([a], [b]) => a.localeCompare(b));

            const groupedList: MenuElement[] = sortedGroupes.map(([category, tempOfGroup]) => ({
                type: 'expand',
                key: category,
                name: category,
                sublist: {
                    type: 'floating',
                    list: tempOfGroup.map(template => ({
                        type: 'button',
                        key: template.id,
                        name: template.name,
                        onClick: () => addNode(template.id, catalogState.location.worldPosition),
                    }))
                }
            }));

            const menuShape: FloatingMenuShape = {
                type: 'floating',
                list: [
                    title,
                    searchBar,
                    ...groupedList,
                ],
            }
            return menuShape;
        }
    }, [graphValidation, searchValue, catalogState]);

    if (!menuShape || !catalogState) return null;

    return (
        <MenuRootFloating
            menuId={menuId}
            menuType={'misc'}
            shape={menuShape}
            onClose={() => {
                dispatch(flowEditorSetStateNeutral({ panelId }))
            }}
            anchor={catalogState.location.clientPosition}
        />
    );
}

export default FlowNodeCatalog;