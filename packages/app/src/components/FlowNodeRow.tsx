import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { FlowNodeRowDiv } from '../styles/flowStyles';
import { RowContext } from '@marble/language';

const ErrorUnderlineSpan = styled.span<{ hasErrors: boolean }>`
    ${({ hasErrors, theme }) => hasErrors && css`
        position: relative;

        p {
            /* background-color: ${theme.colors.general.errorOverlay}; */
            /* text-decoration: underline overline red; */
            text-decoration: red wavy underline;
            /* font-style: italic; */
            /* text-underline-position: auto; */
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
    const hasErrors = !!context?.problems.length;

    return (
        <ErrorUnderlineSpan
            hasErrors={hasErrors}
            onMouseEnter={(hasErrors) => {
                // hasErrors && console.log(context?.problems);
            }}
        >
            <FlowNodeRowDiv>
                {children}
            </FlowNodeRowDiv>
            <span className='error-tooltip'>{context?.problems[0]?.type}</span>
        </ErrorUnderlineSpan>
    );
}

export default FlowNodeRow;
