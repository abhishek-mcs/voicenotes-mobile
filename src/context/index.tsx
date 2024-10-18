import React from 'react';
import { NoteContext, NoteContextProvider } from './recording';
import { ThemeProvider, useTheme } from './theme-context';

const ContextProvider=({children}:any)=>{
    return (
        <ThemeProvider>
            <NoteContextProvider>
                {children}
            </NoteContextProvider>
        </ThemeProvider>
        )
}
export {NoteContext,NoteContextProvider,ContextProvider,useTheme}
