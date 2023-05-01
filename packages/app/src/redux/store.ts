import { AnyAction, configureStore, Dispatch, Middleware, ThunkDispatch } from "@reduxjs/toolkit";
import { CurriedGetDefaultMiddleware } from "@reduxjs/toolkit/dist/getDefaultMiddleware";
import rootReducer from "./rootReducer";

function generateMiddleware(getDefaultMiddleWare: CurriedGetDefaultMiddleware) {
    const middleware: Middleware[] = [
            ...getDefaultMiddleWare({
                serializableCheck: {
                    ignoredPaths: [
                        'recorded.past',
                        'recorded.future',
                        'recorded.present.context',
                        'panels',
                        'panelManager.clientRects',
                        'menus',
                        'commands',
                    ],
                    ignoreActions: true,
                },
            }),
        ];

    // middleware.push(createLogger({
    //     collapsed: true,
    //     actionTransformer: (action: UndoAction) => {
    //         if (action.payload?.undo != null) {
    //             console.log(action.payload.undo.desc);
    //         }
    //         return action;
    //     }
    // }));

    return middleware;
}

export function initStore() {
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