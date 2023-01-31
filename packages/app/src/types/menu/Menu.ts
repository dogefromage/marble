import { AnyAction } from "@reduxjs/toolkit";
import { Point } from "../UtilityTypes";

export interface BaseMenuElement {
    key: string;
    name: string;
    tabIndex?: number;
}

export interface ExpandMenuElement extends BaseMenuElement {
    type: 'expand';
    sublist: FloatingMenuShape;
}

export interface CommandMenuElement extends BaseMenuElement {
    type: 'command';
    command: string;
}

export interface ButtonMenuElement extends BaseMenuElement {
    type: 'button';
    onClick: () => void;
}

export interface SearchMenuElement extends BaseMenuElement {
    type: 'search',
    placeholder: string;
    autofocus: boolean;
}

export interface TitleMenuElement extends BaseMenuElement {
    type: 'title',
    color?: string;
}

export type MenuElement =
    | ExpandMenuElement
    | CommandMenuElement
    | ButtonMenuElement
    | SearchMenuElement
    | TitleMenuElement

export interface InlineMenuShape {
    type: 'inline';
    list: ExpandMenuElement[];
}

export interface FloatingMenuShape {
    type: 'floating';
    list: MenuElement[];
}

export type MenuShape =
    | InlineMenuShape
    | FloatingMenuShape

export interface MenuStackElement {
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