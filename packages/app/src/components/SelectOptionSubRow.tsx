import React from 'react';
import styled from 'styled-components';
import { GNODE_ROW_UNIT_HEIGHT } from '../styles/GeometryRowDiv';
import SelectOption, { SelectOptionProps } from './SelectOption';

const Wrapper = styled.div`
    height: ${GNODE_ROW_UNIT_HEIGHT * 0.8}px;
    margin: ${GNODE_ROW_UNIT_HEIGHT * 0.1}px 0;
`;

const SelectOptionSubRow = (props: SelectOptionProps) => {
    return (
        <Wrapper>
            <SelectOption {...props} />
        </Wrapper>
    );
}

export default SelectOptionSubRow;