import { useCallback, useRef } from 'react';
import useAvaliableCommands from '../hooks/useAvailableCommands';
import useDispatchCommand from '../hooks/useDispatchCommand';
import { useEventListener } from '../hooks/useEventListener';
import matchesKeyCombination from '../utils/commands/matchesKeyCombination';

const KeyboardCommandListener = () =>
{
    const dispatchCommand = useDispatchCommand();
    const commands = useAvaliableCommands();

    const commandsRef = useRef(commands);
    commandsRef.current = commands;

    const handler = useCallback((e: KeyboardEvent) =>
    {
        // console.log(commands);

        for (const command of commands)
        {
            if (!command.keyCombination) continue;
            
            if (matchesKeyCombination(command.keyCombination, e))
            {
                dispatchCommand(command);
            }
        }
    }, [ dispatchCommand ]);

    useEventListener('keydown', handler, document);

    return null;
}

export default KeyboardCommandListener;