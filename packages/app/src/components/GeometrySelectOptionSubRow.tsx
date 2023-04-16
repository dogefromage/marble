import React from 'react';
import styled from 'styled-components';
import { GNODE_ROW_UNIT_HEIGHT } from '../styles/FlowRowDiv';
import FormSelectOption, { SelectOptionProps } from './FormSelectOption';

const Wrapper = styled.div`
    height: ${GNODE_ROW_UNIT_HEIGHT * 0.8}px;
    margin: ${GNODE_ROW_UNIT_HEIGHT * 0.1}px 0;
`;

const GeometrySelectOptionSubRow = (props: SelectOptionProps) => {
    return (
        <Wrapper>
            <FormSelectOption {...props} />
        </Wrapper>
    );
}

export default GeometrySelectOptionSubRow;