import React from 'react';
import { NoteContext, NoteContextProvider } from './recording';
import { ThemeProvider, useTheme } from './theme-context';
import { DialogProvider } from './DialogContext';

const ContextProvider=({children}:any)=>{
    return (
        <ThemeProvider>
            <NoteContextProvider>
                <DialogProvider>
                    {children}
                </DialogProvider>
            </NoteContextProvider>
        </ThemeProvider>
        )
}
export {NoteContext,NoteContextProvider,ContextProvider,useTheme}
