import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { ObjMap, PanelState } from "../../types";


export function selectPanelState<T extends PanelState>(
    selector: (state: RootState) => ObjMap<T>,
    panelId: string,
): T | undefined
{
    return useAppSelector(selector)?.[panelId];
}