import _ from 'lodash';
import React, { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddRow, geometriesRemoveRow, geometriesRename, geometriesReorderRows, geometriesReplaceRow, geometriesUpdateRow, selectSingleGeometry } from '../slices/geometriesSlice';
import MaterialSymbol from '../styles/MaterialSymbol';
import SymbolButton from '../styles/SymbolButton';
import { INSET_SHADOW } from '../styles/utils';
import { allowedInputRowKeys, allowedInputRows, allowedOutputRowKeys, allowedOutputRows, getRowDataTypeCombination, InputRowT, OutputRowT, RowDataTypeCombination, RowT, ViewTypes } from '../types';
import ExpandableRegion from './ExpandableRegion';
import FormRenameField from './FormRenameField';
import FormSelectOption from './FormSelectOption';

const InspectorWrapper = styled.div`
    min-height: 100%;
    overflow-x: hidden;
`

const SettingsTable = styled.div`
    display: grid;
    grid-template-columns: 180px 1fr;
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
            <ExpandableRegion name='Active Geometry' defaultValue={true}> {
                (geometry && geometryId) ? (<>
                    <SettingsTable>
                        <p>Geometry Name</p>
                        <FormRenameField
                            value={geometry.name}
                            onChange={newName => dispatch(geometriesRename({
                                geometryId, newName, undo: {},
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
            </ExpandableRegion>
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

    .add {
        width: 100%;
        aspect-ratio: unset;
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

function rowTHasKey<T extends RowT, K extends keyof T = keyof T>(row: RowT, key: K): row is RowT & Pick<T, K> {
    return Object.hasOwn(row, key);
}

interface RowListProps {
    geometryId: string;
    editable: boolean;
    rows: (InputRowT | OutputRowT)[];
    direction: 'in' | 'out';
}

const RowList = ({ geometryId, rows, editable, direction }: RowListProps) => {

    const dispatch = useAppDispatch();

    const options = direction === 'in' ? allowedInputRowKeys : allowedOutputRowKeys;
    const mapName = direction === 'in' ? allowedInputRows : allowedOutputRows;
    const [ selectedId, setSelectedId ] = useState('');

    function addRow() {
        if (!editable) return;
        dispatch(geometriesAddRow({
            geometryId,
            direction,
            undo: {},
        }));
    }
    
    function removeRow(rowId: string) {
        if (!editable) return;
        dispatch(geometriesRemoveRow({
            geometryId,
            direction,
            rowId,
            undo: {},
        }))
    }

    function setList(newState: typeof rows) {
        const newOrder = newState.map(row => row.id);
        dispatch(geometriesReorderRows({
            geometryId,
            direction,
            newOrder,
            undo: {},
        }));
    }

    function replaceRow(rowId: string, newRowType: RowDataTypeCombination) {
        dispatch(geometriesReplaceRow({
            geometryId,
            rowId,
            direction,
            rowAndDataType: newRowType,
            undo: {},
        }));
    }

    function updateRowName(rowId: string, name: string) {
        dispatch(geometriesUpdateRow({
            geometryId,
            rowId,
            direction,
            newState: { name },
            undo: {},
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
                        selected={row.id === selectedId}
                        onClick={() => setSelectedId(row.id)}
                        disabled={!editable}
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
                                {/* <button className='copy'>
                                    <MaterialSymbol size={18}>content_copy</MaterialSymbol>
                                </button> */}
                                <SymbolButton onClick={() => removeRow(row.id)}>
                                    <MaterialSymbol size={22}>close</MaterialSymbol>
                                </SymbolButton>
                            </div>
                        </div> {
                            // row.id === selectedId &&
                            <SettingsTable className='details'> 
                                <p>Row type</p>
                                <FormSelectOption
                                    value={getRowDataTypeCombination(row.type, row.dataType)}
                                    onChange={newType => replaceRow(row.id, newType as RowDataTypeCombination)}
                                    options={options}
                                    mapName={mapName}
                                /> {
                                    // rowTHasKey<InputRowT>(row, 'value') && <>
                                    //     <p>Default value</p>
                                    //     <p>{JSON.stringify(row.value)}</p>
                                    //     <p>Default input tag</p>
                                    //     <p>{JSON.stringify(row.defaultArgumentToken || null)}</p>
                                    // </>
                                }
                            </SettingsTable>
                        }
                    </RowListItemDiv>
                )}
            </ReactSortable>
            }
            <SymbolButton className='add' onClick={addRow} disabled={!editable}>
                <MaterialSymbol size={20}>add</MaterialSymbol>
            </SymbolButton>
        </RowListDiv>
    </>);
}
