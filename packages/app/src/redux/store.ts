import { AnyAction, configureStore, Dispatch, Middleware, ThunkDispatch } from "@reduxjs/toolkit";
import { CurriedGetDefaultMiddleware } from "@reduxjs/toolkit/dist/getDefaultMiddleware";
import { enableMapSet } from "immer";
import { createLogger } from "redux-logger";
import rootReducer from "./rootReducer";
enableMapSet();

function generateMiddleware(getDefaultMiddleWare: CurriedGetDefaultMiddleware)
{
    const middleware: Middleware[] = 
    [
        ...getDefaultMiddleWare({
            serializableCheck: {
                ignoredPaths: [ 
                    'sceneProgram.textureVarLookupData',
                    'commands',
                    'runtime',
                    'editor.panelManager.clientRects',
                ],
                ignoreActions: true,
            },
        }),
    ];
    
    middleware.push(createLogger({ collapsed: true }));

    return middleware;
}

export function initStore()
{
    // const ydoc = new Y.Doc();
    // const provider = new WebrtcProvider('a0ed1463-e951-45bd-af02-794a050299c9 ', ydoc, { password: 'pw' } as any);

    const store = configureStore({
        reducer: rootReducer,
        middleware: generateMiddleware,
    })

    // bind(ydoc, store, 'todos');

    return store;
}

export type RootState = ReturnType<typeof rootReducer>

export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction> & Dispatch<AnyAction>;