// context/SharedFilesContext.tsx
import React, {
    createContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    ReactNode,
} from 'react';
import {
    Platform,
    NativeModules,
    DeviceEventEmitter,
    AppState,
    AppStateStatus,
} from 'react-native';


import {useSelector} from "react-redux";
import {RootState} from "../redux/store/store";
import {createAudioNote, createImageNote, createTextNote} from "../func/shareReceiver/shareReceiverActions"; // Adjust path and function names

// --- Type Definition ---
interface SharedItem {
    id: string;
    type: 'file' | 'text' | 'url';
    mimeType: string;
    fileName?: string;
    path?: string;
    content?: string;
}

interface SharedFilesContextType {
    // sharedItems might not be needed if cleared immediately, but keep for potential debug/display
    sharedItems: SharedItem[];
    error: string | null;
    isLoading: boolean;
    clearDisplayedItems: () => void; // For manual clearing if ever needed
    clearNativeCache: () => Promise<void>;
    checkIosItems: () => Promise<void>;
}

// --- Native Module Access ---
const {ShareReceiver} = NativeModules;
if (!ShareReceiver && (Platform.OS === 'ios' || Platform.OS === 'android')) {
    console.warn(/* ... warning ... */);
}

// --- Context Definition ---
const defaultContextValue: SharedFilesContextType = {
    sharedItems: [], error: null, isLoading: false,
    clearDisplayedItems: () => {
    },
    clearNativeCache: async () => {
    },
    checkIosItems: async () => {
    },
};
const SharedFilesContext = createContext<SharedFilesContextType>(defaultContextValue);

// --- Provider Component ---
interface SharedFilesProviderProps {
    children: ReactNode;
}

export const SharedFilesProvider = ({children}: SharedFilesProviderProps) => {
    // State for items received from native (cleared after processing)
    const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const processedItemIdRef = useRef<string | null>(null); // Ref to track processed ID

    const appState = useRef(AppState.currentState);

    // --- Get Authentication State ---
    const {token}: any = useSelector((state: RootState) => state.userDetails);
    const isAuthenticated = !!token;

    // --- Native Cache Clearing ---
    const clearNativeCache = useCallback(async () => {
        if (!ShareReceiver?.clearSharedFilesCache) { /* ... warn ... */
            return;
        }
        console.log('[Context] Attempting to clear native file cache...');
        // Avoid setting isLoading if check function manages it
        try {
            await ShareReceiver.clearSharedFilesCache();
            console.log('[Context] Native file cache cleared successfully.');
        } catch (e: any) {
            console.error('[Context] Error clearing native file cache:', e);
            setError(`Clear Cache Error: ${e.message || 'Unknown error'}`);
        }
    }, []);

    // --- Item Processing and Action Logic ---
    // This function is called internally when a *new* item is detected
    const handleReceivedItem = useCallback((item: SharedItem) => {
        console.log(`[Context] handleReceivedItem called for ID: ${item.id}. Authenticated: ${isAuthenticated}`);

        // Check authentication *before* processing/navigating
        if (!isAuthenticated) {
            console.log(`[Context] User not authenticated. Ignoring shared item ID: ${item.id}`);
            // Clear native cache anyway? Optional.
            clearNativeCache().catch(e => console.error("Error clearing native cache:", e));
            return; // Stop processing
        }

        // Proceed with authenticated actions
        try {
            if (item.mimeType.includes('text/') && item.content) {
                console.log("[Context] Item is text, navigating to text note...");
                createTextNote(item.content); // Pass undefined for imagePath initially
            } else if (item.type === 'file') {
                console.log("[Context] Item is file:", item.fileName);
                if (item.mimeType?.includes('audio/') && item.path) {
                    console.log("[Context] Handling audio file:", item.path);
                    createAudioNote(item.path)
                } else if (item.mimeType?.includes('image/') && item.path) {
                    console.log("[Context] Item is image file, navigating to text note with image...");
                    createImageNote(item.path); // Pass image path
                } else {
                    console.warn("[Context] Received unhandled file type:", item.mimeType);
                    clearNativeCache().catch(e => console.error("Error clearing native cache:", e));
                }
            } else {
                console.warn("[Context] Received unknown item type:", item.type);
                clearNativeCache().catch(e => console.error("Error clearing native cache:", e));
            }
        } catch (processingError: any) {
            console.error("[Context] Error during item processing/navigation:", processingError);
            setError(`Failed to process item: ${processingError.message}`);
            // Clear cache even on error?
            clearNativeCache().catch(e => console.error("Error clearing native cache:", e));
        }

    }, [isAuthenticated, clearNativeCache]); // Add dependencies used inside

    // --- iOS: Check for items function ---
    // Uses Native Atomic Read/Clear (Module code from share_receiver_module_atomic_read)
    const checkForIosSharedItems = useCallback(async (triggerSource: string) => {
        console.log(`[Context] checkForIosSharedItems triggered by: ${triggerSource}. Current isLoading: ${isLoading}`);
        if (isLoading || Platform.OS !== 'ios' || !ShareReceiver?.checkForSharedItems) return;

        setIsLoading(true);
        setError(null);
        let processedNewItem = false;
        try {
            const items: SharedItem[] | null = await ShareReceiver.checkForSharedItems();
            console.log(`[Context] iOS Native returned:`, JSON.stringify(items));
            if (items && items.length > 0) {
                const latestItem = items[0];
                if (latestItem?.id && latestItem.id !== processedItemIdRef.current) {
                    processedItemIdRef.current = latestItem.id;
                    handleReceivedItem(latestItem); // Process if new
                    processedNewItem = true;
                } else {
                    console.log(`[Context] iOS item ${latestItem?.id} already processed or invalid.`);
                }
            } else {
                console.log(`[Context] iOS check returned no items.`);
            }
        } catch (e: any) { /* ... error handling ... */
            setError(e.message);
        } finally {
            // Clear internal JS state only if we processed something OR native returned empty/invalid
            // Native module clears UserDefaults, this clears the JS trigger state
            if (processedNewItem) {
                console.log("[Context] Clearing sharedItems state after processing new iOS item.");
                setSharedItems([]);
            }
            setTimeout(() => setIsLoading(false), 0);
        }
    }, [handleReceivedItem]); // Add handleReceivedItem

    // --- Android: Check for pending items function ---
    // Uses Native Queuing (Module code from share_receiver_module_kt_pending)
    const checkForAndroidPendingItems = useCallback(async (triggerSource: string) => {
        console.log(`[Context] checkForAndroidPendingItems triggered by: ${triggerSource}.`);
        if (Platform.OS !== 'android' || !ShareReceiver?.checkForPendingEvents) return;

        try {
            const wasPending = await ShareReceiver.checkForPendingEvents();
            console.log(`[Context] Pending Android check complete. Was pending: ${wasPending}`);
            // Event listener below will handle the actual item if 'wasPending' is true
        } catch (e: any) {
            console.error('[Context] Error checking pending Android events:', e);
            setError("Error checking pending Android shares.");
        }
    }, []); // No dependencies needed here

    // --- Unified Function to fetch and process pending data ---
    const fetchAndProcessPendingData = useCallback(async (triggerSource: string) => {
        console.log(`[Context] fetchAndProcessPendingData triggered by: ${triggerSource}. Current isLoading: ${isLoading}`);
        if (isLoading) {
            return;
        } // Prevent concurrent runs

        let getPromise: Promise<any | null | SharedItem[]>; // Type depends on platform

        if (Platform.OS === 'ios') {
            if (!ShareReceiver?.checkForSharedItems) return;
            console.log(`[Context] Calling iOS checkForSharedItems...`);
            getPromise = ShareReceiver.checkForSharedItems(); // Returns array
        } else if (Platform.OS === 'android') {
            if (!ShareReceiver?.getPendingSharedData) return;
            console.log(`[Context] Calling Android getPendingSharedData...`);
            getPromise = ShareReceiver.getPendingSharedData(); // Returns map or null
        } else {
            return; // Unsupported platform
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await getPromise;
            console.log(`[Context] Native fetch returned (${Platform.OS}):`, JSON.stringify(result));

            let itemsToProcess: SharedItem[] = [];
            if (Platform.OS === 'ios' && result && Array.isArray(result)) {
                itemsToProcess = result;
            } else if (Platform.OS === 'android' && result?.items && Array.isArray(result.items)) {
                // Android native method returns a map { items: [...] }
                itemsToProcess = result.items;
            } else if (Platform.OS === 'android' && result === null) {
                console.log("[Context] Android returned null (no pending data).");
                itemsToProcess = [];
            } else if (result) {
                console.warn("[Context] Received unexpected data format from native:", result);
            }

            if (itemsToProcess.length > 0) {
                const latestItem = itemsToProcess[0]; // Process only the first item if multiple returned
                if (latestItem?.id && latestItem.id !== processedItemIdRef.current) {
                    console.log(`[Context] Found NEW shared item ID: ${latestItem.id}. Processing...`);
                    processedItemIdRef.current = latestItem.id;
                    handleReceivedItem(latestItem); // Process the item
                } else if (latestItem?.id) {
                    console.log(`[Context] Fetched item ID ${latestItem.id}, but it was already processed.`);
                } else {
                    console.warn(`[Context] Fetched item without valid ID.`);
                }
            } else {
                console.log(`[Context] No new items fetched.`);
            }

            // Clear the JS state regardless, as native source should be cleared now
            console.log("[Context] Clearing JS sharedItems state after fetch attempt.");
            setSharedItems([]);

        } catch (e: any) {
            console.error(`[Context] Error during fetchAndProcessPendingData (${Platform.OS}):`, e);
            setError(`Check Error (${Platform.OS}): ${e.message || 'Unknown error'}`);
        } finally {
            console.log(`[Context] fetchAndProcessPendingData (${triggerSource}) finished.`);
            setTimeout(() => setIsLoading(false), 0);
        }
    }, [handleReceivedItem]); // No dependencies needed here

    // --- iOS: AppState listener ---
    useEffect(() => {
        if (Platform.OS !== 'ios') return;
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (!isLoading) {
                    checkForIosSharedItems('AppState active');
                } else {
                    console.log('[Context] AppState active but iOS check in progress.');
                }
            }
            appState.current = nextAppState;
        };
        const sub = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            sub.remove();
        };
    }, [isLoading, checkForIosSharedItems]); // Depend on isLoading and the check function


    // --- Android: Event listener ---
    useEffect(() => {
        if (Platform.OS !== 'android') return;
        let isMounted = true;
        let sub: any = null;

        console.log('[Context] Setting up Android share listener...');

        // Delay setting up the event listener by 300ms
        const timeoutId = setTimeout(() => {
            sub = DeviceEventEmitter.addListener(
                'onShareReceived',
                (event: { items?: SharedItem[] }) => {
                    if (!isMounted) return;
                    console.log('[Context] Android onShareReceived event:', JSON.stringify(event));
                    setError(null);
                    if (event?.items && Array.isArray(event.items) && event.items.length > 0) {
                        const latestItem = event.items[0];
                        if (latestItem?.id && latestItem.id !== processedItemIdRef.current) {
                            processedItemIdRef.current = latestItem.id;
                            handleReceivedItem(latestItem); // Process if new
                            setSharedItems([]); // Clear state after processing initiated
                        } else { /* Log already processed / invalid */
                            setSharedItems([]);
                        }
                    } else { /* Log empty/invalid */
                        setSharedItems(prev => prev.length > 0 ? [] : prev);
                    }
                }
            );
        }, 0); // delay as requested

        // Check for pending events *once* after listener is added
        checkForAndroidPendingItems('Initial mount');
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            sub?.remove();
        };
    }, [handleReceivedItem, checkForAndroidPendingItems]); // Add dependencies

    // --- *** Effect Hook Checking Authentication State *** ---
    useEffect(() => {
        // This runs when the component mounts AND whenever 'isAuthenticated' changes.
        if (isAuthenticated) {
            console.log("[Context] Auth state is TRUE. Triggering check for any pending share data...");
            // Use setTimeout to allow other initializations to potentially complete
            const checkTimeout = setTimeout(() => {
                if (Platform.OS === 'ios') {
                    // Trigger the standard iOS check
                    checkForIosSharedItems('Authenticated Effect');
                } else if (Platform.OS === 'android') {
                    // Trigger the check for pending Android events
                    checkForAndroidPendingItems('Authenticated Effect');
                    fetchAndProcessPendingData('Authenticated Effect');
                }
            }, 150); // Small delay (adjust if needed)

            return () => clearTimeout(checkTimeout); // Cleanup timeout on unmount/re-run

        } else {
            // User is logged out
            console.log("[Context] Auth state is FALSE. Resetting processed item ID.");
            processedItemIdRef.current = null; // Reset processed ID on logout
            setSharedItems([]); // Ensure shared items are cleared on logout
        }
        // Depend on isAuthenticated and the check functions
    }, [isAuthenticated, checkForIosSharedItems, checkForAndroidPendingItems]);
    // --- *** End of Effect Hook *** ---


    // --- Context Helper Functions ---
    const clearDisplayedItems = useCallback(() => {
        setSharedItems([]);
        // Should we reset processed ID on manual clear? Maybe not,
        // as native data might still exist until next check. Let's keep it simple.
        // processedItemIdRef.current = null;
        setError(null);
        console.log('[Context] Cleared displayed items list manually.');
    }, []);


    // Value provided by the context
    const value: SharedFilesContextType = {
        sharedItems, // Provide state for potential UI feedback (loading/error)
        error,
        isLoading,
        clearDisplayedItems,
        clearNativeCache,
        checkIosItems: () => checkForIosSharedItems('manual'), // Allow manual trigger
    };

    return (
        <SharedFilesContext.Provider value={value}>
            {children}
        </SharedFilesContext.Provider>
    );
};

// --- Custom Hook for Consumption ---
// export const useSharedItems = (): SharedFilesContextType => {
//     const context = useContext(SharedFilesContext);
//     if (context === undefined) {
//         throw new Error('useSharedItems must be used within a SharedFilesProvider');
//     }
//     return context;
// };
