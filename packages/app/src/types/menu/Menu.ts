import { AnyAction } from "@reduxjs/toolkit";
import { Point } from "../UtilityTypes";

export interface ExpandMenuElement
{
    type: 'expand';
    name: string;
    sublist: VerticalMenuShape;
}

export interface CommandMenuElement
{
    type: 'command';
    name: string;
    command: string;
}

export interface ButtonMenuElement
{
    type: 'button';
    name: string;
    onClick: () => void;
}

export interface SearchMenuElement
{
    type: 'search',
    name: string;
    placeholder: string;
    autofocus: boolean;
}

export interface TitleMenuElement
{
    type: 'title',
    name: string;
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

export enum MenuTypes {
    Toolbar = 'toolbar',
    Context = 'context',
    Misc = 'misc',
}