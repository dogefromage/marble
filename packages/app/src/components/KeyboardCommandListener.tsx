import { useCallback, useRef } from 'react';
import useDispatchCommand from '../hooks/useDispatchCommand';
import { useEventListener } from '../hooks/useEventListener';
import { useAppSelector } from '../redux/hooks';
import { selectCommands } from '../slices/commandsSlice';
import { Command, CommandCallTypes, ObjMap } from '../types';
import matchesKeyCombination from '../utils/commands/matchesKeyCombination';

const KeyboardCommandListener = () =>
{
    const dispatchCommand = useDispatchCommand();
    const { commands } = useAppSelector(selectCommands);

    const commandsRef = useRef(commands);
    commandsRef.current = commands;

    const handler = useCallback((e: KeyboardEvent) =>
    {
        if (document.activeElement instanceof HTMLInputElement)
            return;

        for (const _command of Object.values(commands))
        {
            const command = _command!; // is def.
            
            if (!command.keyCombinations) continue;

            for (const combination of command.keyCombinations)
            {
                if (matchesKeyCombination(combination, e))
                {
                    dispatchCommand(command, {}, CommandCallTypes.KeyCombination);
                    e.preventDefault();
                }
            }
        }
    }, [ dispatchCommand ]);

    useEventListener('keydown', handler, document);

    return null;
}

export default KeyboardCommandListener;