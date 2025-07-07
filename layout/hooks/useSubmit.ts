
/**
 * This is a custom hook for handling form submissions (POST and PUT requests).
 * It simplifies the process of sending data to the server and provides loading state
 * and automatic notifications (toasts) for success or error messages.
 */
import { useState, useContext } from 'react';
import { LayoutContext } from '@/layout/context/layoutcontext'; // To get the authentication token
import { baseUrl } from '@/app/utilis/webinfo'; // To get the API base URL
import callToast from '@/app/utilis/helper'; // To show success/error notifications

// Defines the HTTP methods this hook can handle
type HttpMethod = 'POST' | 'PUT';

// Defines the structure of the options object that the submitRequest function will accept
interface SubmitOptions {
    method: HttpMethod; // The HTTP method to use (POST or PUT)
    body: any; // The data to send in the request body
}

// This is the main hook function
export const useSubmit = () => {
    // State to track if a request is currently in progress.
    // This is useful for showing loading spinners on buttons.
    const [loading, setLoading] = useState<boolean>(false);

    // Get the accessToken from the LayoutContext.
    // The LayoutContext provides shared state across the application.
    const { accessToken } = useContext(LayoutContext);

    /**
     * This is the core function that sends the request to the API.
     * @param endpoint - The API endpoint to send the request to (e.g., '/api/food_ingredient_inventory_trace').
     * @param options - An object containing the method (POST/PUT) and the request body.
     * @param toastRef - A reference to the Toast component, so we can display notifications.
     */
    const submitRequest = async (endpoint: string, options: SubmitOptions, toastRef: any) => {
        // Set loading to true at the beginning of the request
        setLoading(true);

        try {
            // Use the browser's fetch API to send the request.
            // We construct the full URL from the baseUrl and the endpoint.
            const response = await fetch(`${baseUrl?.url}${endpoint}`, {
                method: options.method,
                headers: {
                    'Content-Type': 'application/json', // Tell the server we're sending JSON data
                    'Authorization': `Bearer ${accessToken}`, // Include the authentication token
                },
                body: JSON.stringify(options.body), // Convert the JavaScript object to a JSON string
            });

            // Parse the JSON response from the server
            const responseData = await response.json();

            // Check if the request was unsuccessful (e.g., status code 400, 500)
            if (!response.ok) {
                // If there's an error, show an error toast with the message from the server
                callToast(toastRef, false, responseData.message || 'An error occurred');
                return null; // Return null to indicate failure
            }
            
            // If the request was successful, show a success toast
            callToast(toastRef, true, responseData.message || 'Operation successful');
            return responseData; // Return the successful response data

        } catch (e: any) {
            // If there's a network error or other exception, show an error toast
            callToast(toastRef, false, e.message || 'An error occurred');
            return null; // Return null to indicate failure
        } finally {
            // This block will run whether the request succeeded or failed.
            // Set loading back to false.
            setLoading(false);
        }
    };

    // Return the loading state and the submitRequest function from the hook,
    // so they can be used in our components.
    return { loading, submitRequest };
};
