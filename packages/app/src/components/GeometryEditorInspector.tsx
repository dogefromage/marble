import _ from 'lodash';
import React, { Fragment, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { ReactSortable } from 'react-sortablejs';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddRow, geometriesRemoveRow, geometriesRename, geometriesReorderRows, geometriesReplaceRow, geometriesUpdateRow, selectSingleGeometry } from '../slices/geometriesSlice';
import { BOX_SHADOW, INSET_SHADOW } from '../styles/utils';
import { allowedInputRowKeys, allowedInputRows, allowedOutputRowKeys, allowedOutputRows, GeometryS, getRowDataTypeCombination, InputRowT, OutputRowT, RowDataTypeCombination, RowT, RowTypes, SpecificRowT, ViewTypes } from '../types';
import ExpandableRegion from './ExpandableRegion';
import MaterialSymbol from './MaterialSymbol';
import RenameField from './RenameField';
import SelectOption from './SelectOption';

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

const Section = styled.div`
    margin-left: 5px;
    border-left: solid 1px black;
    padding-left: 10px;
    margin-bottom: 10px;
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
                    <p>GENERAL</p>
                    <Section>
                        <SettingsTable>
                            <p>Geometry Name</p>
                            <RenameField
                                value={geometry.name}
                                onChange={newName => dispatch(geometriesRename({
                                    geometryId, newName, undo: {},
                                }))}
                            />
                            <p>Is root</p>{ JSON.stringify(geometry.isRoot) }
                        </SettingsTable>
                    </Section>
                    <p>INPUTS { geometry.isRoot && '(ROOT)'}</p> 
                    <Section>
                        <RowList geometryId={geometryId} editable={!geometry.isRoot} rows={geometry.inputs} direction='in' />
                    </Section>
                    <p>OUTPUTS { geometry.isRoot && '(ROOT)'}</p>
                    <Section>
                        <RowList geometryId={geometryId} editable={!geometry.isRoot} rows={geometry.outputs} direction='out' />
                    </Section>
                </>) : (
                    <p>No active geometry found</p>
                )
            }
            </ExpandableRegion>
        </InspectorWrapper>
    );
}

export default GeometryEditorInspector;



const RowListDiv = styled.div<{ isDisabled: boolean }>`
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
        display: flex;
        justify-content: center;
        align-items: center;

        outline: none;
        border: none;
        background-color: unset;

        cursor: ${({ isDisabled }) => isDisabled ? 'not-allowed' : 'pointer' };

        &:hover {
            background-color: #bbb;
        }
    }
`;

const RowListItemDiv = styled.div<{ isSelected: boolean, isDisabled: boolean }>`
    width: 100%;
    height: 1.8rem;
    /* ${BOX_SHADOW} */
    background-color: ${({ isSelected }) => isSelected ? '#ccc' : '#eee'};
    padding: 0 0.5rem;

    display: flex;
    justify-content: space-between;
    align-items: center;

    cursor: ${({ isDisabled }) => isDisabled ? 'not-allowed' : 'move' };

    .left, .right {
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 0.25rem;

        button:is(.close, .copy) {

            width: 1.4rem;
            aspect-ratio: 1;

            outline: none;
            border: none;
            background-color: unset;
            
            display: flex;
            align-items: center;
            justify-content: center;
            
            cursor: ${({ isDisabled }) => isDisabled ? 'not-allowed' : 'pointer' };

            &:hover {
                background-color: #bbb;
            }
        }
    }
`;

const RowDetailsDiv = styled.div`
    display: flex;
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
    const [selectedId, setSelectedId] = useState('');
    const selectedRow = editable && rows.find(row => row.id === selectedId);

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
        <RowListDiv isDisabled={!editable}> {
            <ReactSortable 
                list={mutableRows} 
                setList={setList}
                className='sortable-div'
                disabled={!editable}
            >{ // <-- do not insert space
                rows.map(row =>
                    <RowListItemDiv
                        key={row.id}
                        isSelected={row.id === selectedId}
                        onClick={() => setSelectedId(row.id)}
                        isDisabled={!editable}
                    >
                        <div className='left'>
                            <RenameField 
                                value={row.name} 
                                onChange={newValue => updateRowName(row.id, newValue)} 
                                disabled={!editable}
                            />
                        </div>
                        <div className='right'>
                            {/* <button className='copy'>
                                <MaterialSymbol size={18}>content_copy</MaterialSymbol>
                            </button> */}
                            <button className='close' onClick={() => removeRow(row.id)}>
                                <MaterialSymbol size={20}>close</MaterialSymbol>
                            </button>
                        </div>
                    </RowListItemDiv>
                )}
            </ReactSortable>
        }
        <button className='add' onClick={addRow}>
            <MaterialSymbol size={20}>add</MaterialSymbol>
        </button>
        </RowListDiv>
        {
            selectedRow && (<>
                <p>Details of row <b>{selectedRow.name}</b></p>
                <SettingsTable>
                    <p>Row type</p>
                    <SelectOption
                        value={getRowDataTypeCombination(selectedRow.type, selectedRow.dataType)}
                        onChange={newType => replaceRow(selectedRow.id, newType as RowDataTypeCombination)}
                        options={options}
                        mapName={mapName}
                    /> {
                        rowTHasKey<InputRowT>(selectedRow, 'value') && <>
                            <p>Default value</p>
                            <p>{JSON.stringify(selectedRow.value)}</p>
                            <p>Default argument</p>
                            <p>{JSON.stringify(selectedRow.defaultArgumentToken || null)}</p>
                        </>
                    }
                </SettingsTable>
            </>)
        }
    </>);
}
