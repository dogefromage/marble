import { useCallback, useRef } from 'react';
import { useEventListener } from '../hooks/useEventListener';
import { useAppSelector } from '../redux/hooks';
import { selectCommands } from '../slices/commandsSlice';
import { matchesKeyCombination } from '../utils/commands/keyCombinations';
import useDispatchCommand from '../utils/commands/useDispatchCommand';

const KeyboardCommandListener = () => {
    const dispatchCommand = useDispatchCommand();
    const { commands } = useAppSelector(selectCommands);

    const commandsRef = useRef(commands);
    commandsRef.current = commands;

    const handler = useCallback((e: KeyboardEvent) => {
        if (document.activeElement instanceof HTMLInputElement)
            return;

        for (const _command of Object.values(commands)) {
            const command = _command!; // is def.

            if (!command.keyCombinations) continue;

            for (const combination of command.keyCombinations) {
                if (matchesKeyCombination(combination, e)) {
                    dispatchCommand(command.id, {}, 'keycombination');
                    e.preventDefault();
                }
            }
        }
    }, [ dispatchCommand ]);

    useEventListener('keydown', handler, document);

    return null;
}

export default KeyboardCommandListener;