
```ts
export interface Command
{
    id: string;
    name: string;
    description: string;
    keyCombinations: KeyCombination[];
}

// Global command:
useAddGlobalCommand({
    name: "Undo",
    description: "Undoes",
    actionCreator: undoEnhancerUndo(),
})


// // Local command:
// useAddLocalCommand({
//     name: "Delete Nodes",
//     description: "Deletes",
//     actionCreator: () => {
//         const currentSelectedNodes = [ n1, n2 ... nm ];
//         return geometriesRemoveNodes(currentSelectedNodes);
//     },
// })


// alternative:
useAddLocalCommand({
    name: "Delete Nodes",
    description: "Deletes",
    scope: CommandScopes.GeometryEditor,
    actionCreator: ({ active, selection, panelId, etc... }: GeometriesCommandParams) => {
        return geometriesRemoveNodes(selection);
    },
})

// example action


useAddLocalCommand({
    name: "Align vertical",
    actionCreator: ({ selection }) => {
        // ...
    },
})

useAddLocalCommand({
    name: "Move to new geometry",
    actionCreator: ({ selection }) => {
        // ...
    },
})

useAddLocalCommand({
    name: "Reset values",
    actionCreator: ({ active }) => {
        // ...
    },
})

```

Both hooks useAddLocalCommand, useAddGlobalCommand
temporarly register commands to some central state, where
they can be listed / executed.

## Palette
A command palette should display the currently avaiable commands in a list like blender, vscode.

## Contextmenu
The context menu should display locally available commands (unsure how).

## Keybinds
If a keybinding is registered on the current command list
some <Keybindings> component will execute the command.