import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { FlowNodeRowDiv } from '../styles/flowStyles';
import { RowContext } from '@marble/language';

const ErrorUnderlineSpan = styled.span<{ hasErrors: boolean }>`
    ${({ hasErrors }) => hasErrors && css`
        position: relative;

        p {
            text-decoration: red wavy underline;
            text-underline-position: auto;
        }

        .error-tooltip {
            position: absolute;
            visibility: hidden;
            width: 120px;
            background-color: black;
            color: #fff;
            text-align: center;
            padding: 5px 0;
            border-radius: 6px;
            z-index: 1;
            top: -5px;
            left: 105%;
        }

        &:hover .error-tooltip {
            visibility: visible;
        }
    `}
`;

interface Props {
    context: RowContext | undefined;
    children: ReactNode;
}

const FlowNodeRow = ({ context, children }: Props) => {

    return (
        <ErrorUnderlineSpan
            hasErrors={!!context?.problems.length}
        >
            <FlowNodeRowDiv>
                {children}
            </FlowNodeRowDiv>
            <span className='error-tooltip'>{context?.problems[0]?.type}</span>
        </ErrorUnderlineSpan>
    );
}

export default FlowNodeRow;
