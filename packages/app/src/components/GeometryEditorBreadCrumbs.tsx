import React from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { geometryEditorPanelsSetGeometryId } from '../slices/panelGeometryEditorSlice';
import { BOX_SHADOW } from '../styles/utils';

const BreadcrumbsWrapperDiv = styled.div`
    top: 0.5rem;
    left: 1rem;
    position: absolute;
    display: flex;
    flex-direction: row-reverse;
    gap: 0rem;
`;

const BreadcrumbsDiv = styled.div`

    filter: 
        drop-shadow(3px 4px #00000055)
        
    
    ;

    a {
        display: block;
        height: 1.6rem;

        --l: 0.5rem;
        --r: calc(100% - var(--l));

        clip-path: polygon(
            0 0,
            var(--r) 0,
            100% 50%,
            var(--r) 100%,
            0 100%,
            var(--l) 50%
        );

        padding: 0.25rem 1rem;
        background-color: white;
        display: flex;
        align-items: center;
        font-weight: bold;
        cursor: pointer;
        
        &:hover {
            background-color: #ddd;
        }
    }
`;

interface Props {
    panelId: string;
    geometryStack: string[];
}

const GeometryEditorBreadCrumbs = ({ panelId, geometryStack }: Props) => {

    const geometries = useAppSelector(selectGeometries);
    const dispatch = useAppDispatch();

    const selectGeometry = (geometryId: string) => {
        dispatch(geometryEditorPanelsSetGeometryId({
            panelId, geometryId,
        }));
    }

    return (
        <BreadcrumbsWrapperDiv>
        {
            geometryStack.map((geometryId, index) => 
                <BreadcrumbsDiv
                    key={geometryId + index}
                >
                    {/* <div className='inner'> */}
                        <a onClick={() => selectGeometry(geometryId)}>
                            { geometries[geometryId]?.name || geometryId }
                        </a>
                    {/* </div> */}
                </BreadcrumbsDiv>
            )
        }
        </BreadcrumbsWrapperDiv>
    );
}

export default GeometryEditorBreadCrumbs;