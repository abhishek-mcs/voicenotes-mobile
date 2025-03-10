import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

// Define the type for the callback function
type BackgroundTaskCallback = () => Promise<void>;

// Global function to register a background fetch task
export async function registerBackgroundTask(
  taskName: string,
  callback: BackgroundTaskCallback,
  interval: number = 900 // Default: 15 minutes
): Promise<void> {
  // Define the task dynamically
  TaskManager.defineTask(taskName, async () => {
    console.log(`Executing background task: ${taskName}`);

    try {
      await callback(); // Execute the provided function
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error(`Error in background task ${taskName}:`, error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });

  // Register the background fetch task
  const status = await BackgroundFetch.getStatusAsync();

  if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
    console.log(`Registering background fetch task: ${taskName}`);
    await BackgroundFetch.registerTaskAsync(taskName, {
      minimumInterval: interval, // Interval in seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } else {
    console.log(`Background fetch not available for task: ${taskName}`);
  }
}

// Function to unregister a task
export async function unregisterBackgroundTask(taskName: string): Promise<void> {
  await BackgroundFetch.unregisterTaskAsync(taskName);
  console.log(`Unregistered background task: ${taskName}`);
}

// Function to check if a task is registered
export async function isTaskRegistered(taskName: string): Promise<boolean> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
  console.log(`Task "${taskName}" registered: ${isRegistered}`);
  return isRegistered;
}
