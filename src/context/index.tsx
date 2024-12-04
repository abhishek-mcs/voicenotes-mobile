import React from 'react';
import { NoteContext, NoteContextProvider } from './recording';

const ContextProvider=({children}:any)=>{
    return (
        <NoteContextProvider>
            {children}
        </NoteContextProvider>
        )
}
export {NoteContext,NoteContextProvider,ContextProvider}
