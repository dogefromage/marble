import { useCallback, useRef } from 'react';
import useAvaliableCommands from '../hooks/useAvailableCommands';
import useDispatchCommand from '../hooks/useDispatchCommand';
import { useEventListener } from '../hooks/useEventListener';
import { CommandCallTypes } from '../types';
import matchesKeyCombination from '../utils/commands/matchesKeyCombination';

const KeyboardCommandListener = () =>
{
    const dispatchCommand = useDispatchCommand();
    const commands = useAvaliableCommands();

    const commandsRef = useRef(commands);
    commandsRef.current = commands;

    const handler = useCallback((e: KeyboardEvent) =>
    {
        for (const command of Object.values(commands))
        {
            if (!command.keyCombinations) continue;

            for (const combination of command.keyCombinations)
            {
                if (matchesKeyCombination(combination, e))
                {
                    dispatchCommand(command, {}, CommandCallTypes.KeyCombination);
                }
            }
        }
    }, [ dispatchCommand ]);

    useEventListener('keydown', handler, document);

    return null;
}

export default KeyboardCommandListener;