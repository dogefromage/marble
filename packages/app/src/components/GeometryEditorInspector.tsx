import _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddCustomRow, geometriesAddDefaultRow, geometriesRemoveRow, geometriesRename, geometriesReorderRows, geometriesReplaceRow, geometriesUpdateRow, selectSingleGeometry } from '../slices/flowsSlice';
import MaterialSymbol from '../styles/MaterialSymbol';
import SymbolButton from '../styles/SymbolButton';
import { INSET_SHADOW } from '../styles/utils';
import { allowedInputRowKeys, allowedInputRows, allowedOutputRowKeys, allowedOutputRows, getRowDataTypeCombination, InputRowT, Obj, ObjMapUndef, OutputRowT, RowDataTypeCombination, RowT, SpecificRowT, ViewTypes } from '../types';
import { defaultInputRows, defaultOutputRows } from '../types/geometries/defaultRows';
import FormExpandableRegion from './FormExpandableRegion';
import FormRenameField from './FormRenameField';
import FormSelectOption from './FormSelectOption';

const InspectorWrapper = styled.div`
    min-height: 100%;
    overflow-x: hidden;
`

const SettingsTable = styled.div`
    display: grid;
    grid-template-columns: 140px 1fr;
    align-items: center;
    grid-row-gap: 0.5rem;
`;

interface Props {
    panelId: string
}

const GeometryEditorInspector = ({ panelId }: Props) => {
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));
    const geometryId = panelState?.geometryStack[0];
    const geometry = useAppSelector(selectSingleGeometry(geometryId));

    return (
        <InspectorWrapper>
            <FormExpandableRegion name='Active Geometry' defaultValue={true}> {
                (geometry && geometryId) ? (<>
                    <SettingsTable>
                        <p>Geometry Name</p>
                        <FormRenameField
                            value={geometry.name}
                            onChange={newName => dispatch(geometriesRename({
                                geometryId, newName, undo: { desc: `Renamed geometry to ${newName}.` },
                            }))}
                        />
                    </SettingsTable>
                    <p>INPUTS { geometry.isRoot && '(ROOT)'}</p> 
                    <RowList geometryId={geometryId} editable={!geometry.isRoot} rows={geometry.inputs} direction='in' />
                    <p>OUTPUTS { geometry.isRoot && '(ROOT)'}</p>
                    <RowList geometryId={geometryId} editable={!geometry.isRoot} rows={geometry.outputs} direction='out' />
                </>) : (
                    <p>No active geometry found</p>
                )
            }
            </FormExpandableRegion>
        </InspectorWrapper>
    );
}

export default GeometryEditorInspector;

const RowListDiv = styled.div<{ disabled: boolean }>`
    width: 100%;
    padding: 8px;
    background-color: #e1e1e1;
    ${INSET_SHADOW}
    border-radius: 3px;

    display: flex;
    flex-direction: column;
    gap: 5px;

    .sortable-div {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
`;

interface RowListItemDivProps {
    selected: boolean;
    disabled: boolean;
}

const RowListItemDiv = styled.div.attrs<RowListItemDivProps>(({ selected }) => ({
    className: selected && 'selected',
}))<RowListItemDivProps>`
    width: 100%;
    height: fit-content;
    max-height: 1.8rem;
    transition: max-height 250ms cubic-bezier(.4,.01,.59,1.11);
    overflow: hidden;
    
    &.selected {
        max-height: 150px;
    }

    background-color: ${({ selected: isSelected }) => isSelected ? '#ccc' : '#eee'};
    &:active {
        background-color: #ccc;
    }

    padding: 0 0.5rem;
    
    display: flex;
    flex-direction: column;

    .header{
        cursor: pointer;

        height: 1.8rem;
        flex-shrink: 0;

        display: flex;
        justify-content: space-between;
        align-items: center;

        .left, .right {
            display: flex;
            justify-content: space-around;
            align-items: center;
            gap: 0.25rem;
    
            .handle {
                width: 1.4rem;
                aspect-ratio: 1;
                
                display: flex;
                align-items: center;
                justify-content: center;
    
                cursor: ${({ disabled: isDisabled }) => isDisabled ? 'not-allowed' : 'move' };
            }
        }
    }

    .details {
        margin: 0.25rem 0;
        border-top: solid 1px #00000077;
        padding-top: 0.25rem;
        
        &>* {
            min-height: 1.4rem;
        }
    }
`;

const AddSplitDiv = styled.div`
    display: grid;
    grid-template-columns: 1fr /* 1fr */;
    gap: 1rem;

    .add-dropdown {
        background-color: #eee;
        &:active {
            background-color: #ccc;
        }
    }
`;

function rowTHasKey<T extends RowT, K extends keyof T = keyof T>(row: RowT, key: K): row is RowT & Pick<T, K> {
    return Object.hasOwn(row, key);
}

interface RowListProps {
    geometryId: string;
    editable: boolean;
    rows: (InputRowT | OutputRowT)[];
    direction: 'in' | 'out';
}

const fullDirection = {
    'in': 'input', 'out': 'output',
}

const RowList = ({ geometryId, rows, editable, direction }: RowListProps) => {

    const dispatch = useAppDispatch();
    const options = direction === 'in' ? allowedInputRowKeys : allowedOutputRowKeys;
    const mapName = direction === 'in' ? allowedInputRows    : allowedOutputRows   ;
    const [ selectedId, setSelectedId ] = useState('');

    // // default rows
    // const defaultRows = (direction === 'in' ?
    //     defaultInputRows : defaultOutputRows) as ObjMap<InputRowT> | ObjMap<OutputRowT>;
    // const defaultRowKeys = Object.keys(defaultRows);
    // const defaultRowNameMap = defaultRowKeys.reduce((nameMap, key) => {
    //     nameMap[key] = defaultRows[key].name;
    //     return nameMap;
    // }, {} as ObjMap<string>);

    const addCustomRow = (rowAndDataType: RowDataTypeCombination) => {
        if (!editable) return;
        dispatch(geometriesAddCustomRow({
            geometryId,
            direction,
            rowAndDataType,
            undo: { desc: `Added ${fullDirection[direction]} row to active geometry.`},
        }));
    }

    // const addDefaultRow = (defaultRowKey: string) => {
    //     const defaultRow = defaultRows[defaultRowKey];
    //     if (!editable || !defaultRow) return;
    //     dispatch(geometriesAddDefaultRow({
    //         geometryId,
    //         direction,
    //         defaultRow,
    //         undo: { desc: `Added default ${fullDirection[direction]} row to active geometry.`},
    //     }));
    // }

    const removeRow = (rowId: string) => {
        if (!editable) return;
        dispatch(geometriesRemoveRow({
            geometryId,
            direction,
            rowId,
            undo: { desc: `Removed ${fullDirection[direction]} row "${rowId}" from active geometry.` },
        }))
    }

    const setList = (newState: typeof rows) => {
        if (!editable) return;
        const newOrder = newState.map(row => row.id);
        dispatch(geometriesReorderRows({
            geometryId,
            direction,
            newOrder,
            undo: { desc: `Reordered ${fullDirection[direction]} rows of active geometry.` },
        }));
    }

    const replaceRow = (rowId: string, rowAndDataType: RowDataTypeCombination) => {
        if (!editable) return;
        dispatch(geometriesReplaceRow({
            geometryId,
            rowId,
            direction,
            rowAndDataType,
            undo: { desc: `Replaced ${fullDirection[direction]} row "${rowId}" with a new row of type "${rowAndDataType}".` },
        }));
    }

    const updateRowName = (rowId: string, name: string) => {
        if (!editable) return;
        dispatch(geometriesUpdateRow({
            geometryId,
            rowId,
            direction,
            newState: { name },
            undo: { desc: `Renamed ${fullDirection[direction]} row to ${name}.` },
        }));
    }

    // ReactSortable MUST mutate 
    const mutableRows = _.cloneDeep(rows);
    
    return (<>
        <RowListDiv disabled={!editable}> {
            <ReactSortable 
                list={mutableRows} 
                setList={setList}
                className='sortable-div'
                disabled={!editable}
                handle='.handle'
                animation={100}
            >{ // <-- do not insert space
                rows.map(row =>
                    <RowListItemDiv
                        key={row.id}
                        disabled={!editable}
                        selected={editable && row.id === selectedId}
                        onClick={() => setSelectedId(row.id)}
                    >
                        <div className='header'>
                            <div className='left'>
                                <MaterialSymbol className='handle' size={20}>drag_handle</MaterialSymbol>
                                <FormRenameField 
                                    value={row.name} 
                                    onChange={newValue => updateRowName(row.id, newValue)} 
                                    disabled={!editable}
                                />
                            </div>
                            <div className='right'>
                                <SymbolButton onClick={() => removeRow(row.id)} disabled={!editable}>
                                    <MaterialSymbol size={22}>close</MaterialSymbol>
                                </SymbolButton>
                            </div>
                        </div> {
                            editable && 
                            <SettingsTable className='details'> 
                                <p>Row type</p>
                                <FormSelectOption
                                    value={getRowDataTypeCombination(row.type, row.dataType)}
                                    onChange={newType => replaceRow(row.id, newType as RowDataTypeCombination)}
                                    options={options}
                                    mapName={mapName}
                                />
                            </SettingsTable>
                        }
                    </RowListItemDiv>
                )}
            </ReactSortable>
            } {
                editable &&
                <AddSplitDiv>
                    <FormSelectOption 
                        className='add-dropdown' 
                        onChange={addCustomRow as (rowAndDataType: string) => void} 
                        options={options} 
                        mapName={mapName}
                        icon='add'
                        value='Add Custom'
                    />
                    {/* <FormSelectOption 
                        className='add-dropdown' 
                        onChange={addDefaultRow} 
                        mapName={defaultRowNameMap} 
                        options={defaultRowKeys}
                        icon='add'
                        value='Add default'
                    /> */}
                </AddSplitDiv>
            }
        </RowListDiv>
    </>);
}
