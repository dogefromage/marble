import { AnyAction } from "@reduxjs/toolkit";
import { Point } from "../UtilityTypes";

export interface SuperMenuElement {
    key: string;
    name: string;
}

export interface ExpandMenuElement extends SuperMenuElement
{
    type: 'expand';
    sublist: VerticalMenuShape;
}

export interface CommandMenuElement extends SuperMenuElement
{
    type: 'command';
    command: string;
}

export interface ButtonMenuElement extends SuperMenuElement
{
    type: 'button';
    onClick: () => void;
}

export interface SearchMenuElement extends SuperMenuElement
{
    type: 'search',
    placeholder: string;
    autofocus: boolean;
}

export interface TitleMenuElement extends SuperMenuElement
{
    type: 'title',
    color?: string;
}

export type MenuElement =
    | ExpandMenuElement
    | CommandMenuElement
    | ButtonMenuElement
    | SearchMenuElement
    | TitleMenuElement

export interface HorizontalMenuShape
{
    type: 'horizontal';
    list: ExpandMenuElement[];
}

export interface VerticalMenuShape
{
    type: 'vertical';
    list: MenuElement[];
}

export type MenuShape = 
    | HorizontalMenuShape
    | VerticalMenuShape

export interface MenuStackElement 
{
    key: string;
    position: Point;
}

export interface MenuState {
    type: MenuTypes;
    stack: MenuStackElement[];
    closed: boolean;
    searchValue: string;
}

export interface MenuStore {
    state: MenuState;
    dispatch: React.Dispatch<AnyAction>;
}
 
export type MenuTypes = 'toolbar' | 'context' | 'misc';