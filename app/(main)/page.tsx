"use client"
// --- React and Next.js Core ---
// We need more hooks from React for managing state and side effects.
import React, { useState, useEffect, useRef, useContext } from 'react';

// --- PrimeReact UI Components ---
// These are the building blocks for our user interface.
import { DataTable } from 'primereact/datatable';   // For the main data table
import { Column } from 'primereact/column';       // For defining columns in the table
import { Button } from 'primereact/button';       // For all the buttons (Add, Edit, Delete)
import { Dialog } from 'primereact/dialog';       // For the pop-up form
import { InputText } from 'primereact/inputtext'; // For the form input fields
import { Toast } from 'primereact/toast';         // For showing success/error notifications

// --- Project-Specific Hooks and Helpers ---
// These are the custom functions from your boilerplate for handling API calls.
import { useFetch } from '@/layout/hooks/useFetch';      // To GET data from the API
import { useSubmit } from '@/layout/hooks/useSubmit';    // To POST and PUT data to the API
import { handleDelete as deleteHelper } from '@/app/utilis/helper'; // To DELETE data. We rename it to "deleteHelper" to avoid naming conflicts.
import { LayoutContext } from '@/layout/context/layoutcontext'; // To get the auth token for the delete helper

// --- Existing Project Components ---
import { FoodIngredientInventory } from '@/types/inventory'; // Import our new type definition
import PageHeading from "@/components/PageHeading";

const HomePage = () => {
    const toast = useRef(null);

    // State to hold the list of inventory items fetched from the API.
    // We use our new FoodIngredientInventory type for better type safety.
    const [inventory, setInventory] = useState<FoodIngredientInventory[]>([]);

    // A state to trigger a refetch of the data.
    // When 'update' changes, the useFetch hook will re-run, getting fresh data.
    const [update, setUpdate] = useState(false);

    // useFetch hook:
    // - '/api/food_ingredient_inventory_trace?page=0&size=10&sort=-id' is the API endpoint.
    // - [update] is the dependency array. The fetch will re-run whenever 'update' changes.
    // - 'data' will hold the fetched data, 'fetchLoading' indicates if the data is being fetched.
    const { data, loading: fetchLoading } = useFetch('/api/food_ingredient_inventory_trace?page=0&size=10&sort=-id', [update]);

    // useSubmit hook:
    // - 'submitLoading' indicates if a POST/PUT request is in progress.
    // - 'submitRequest' is the function we'll call to send data.
    const { loading: submitLoading, submitRequest } = useSubmit();

    // Get the accessToken from the LayoutContext.
    // This token is needed for authenticated API calls, especially for delete operations.
    const { accessToken } = useContext(LayoutContext);

    // State for managing the Add/Edit dialog (pop-up form).
    const [showForm, setShowForm] = useState(false); // Controls visibility of the dialog.
    const [isEdit, setIsEdit] = useState(false);     // True if editing, false if adding new.
    const [currentRecord, setCurrentRecord] = useState<FoodIngredientInventory | null>(null); // Holds data of the record being edited/added.

    // useEffect hook to update the 'inventory' state when 'data' from useFetch changes.
    // This ensures our component's state reflects the latest data from the API.
    useEffect(() => {
        // The API response structure has a 'data' object with an 'items' array.
        // The 'data' returned by useFetch already points to this inner 'data' object.
        if (data && data.items) { // Corrected access: data.items instead of data.data.items
            setInventory(data.items);
        }
    }, [data]);

    // Function to open the dialog for adding a new record.
    const handleAdd = () => {
        setIsEdit(false); // Set to false because we are adding, not editing.
        // Initialize currentRecord with empty values for the form fields.
        setCurrentRecord({
            food_ingredient_id: 0,
            quantity: 0,
            total_amount: 0,
            supplier_id: 0,
        });
        setShowForm(true); // Show the dialog.
    };

    // Function to open the dialog for editing an existing record.
    const handleEdit = (record: FoodIngredientInventory) => {
        setIsEdit(true); // Set to true because we are editing.
        // Set currentRecord to the data of the record being edited.
        setCurrentRecord({ ...record }); // Create a copy to avoid direct state mutation.
        setShowForm(true); // Show the dialog.
    };

    // Function to delete a record.
    // It uses the 'deleteHelper' function from '@/app/utilis/helper'.
    const handleDelete = (record: FoodIngredientInventory) => {
        deleteHelper({
            id: record.id!, // The ID of the record to delete. We use '!' because we know 'id' will be present for a record being deleted.
            endPoint: '/api/food_ingredient_inventory_trace', // The API endpoint for deletion.
            name: 'Inventory Record', // A user-friendly name for the toast message.
            toast: toast, // Reference to the Toast component for notifications.
            token: accessToken, // The authentication token from LayoutContext.
            refetch: () => setUpdate(prev => !prev) // Callback to trigger data refetch after deletion.
        });
    };

    // Function to save a new record or update an existing one.
    // It uses the 'submitRequest' function from our 'useSubmit' hook.
    const handleSave = async () => {
        // Determine the API URL based on whether we are adding or editing.
        const url = isEdit
            ? `/api/food_ingredient_inventory_trace/${currentRecord?.id}` // For PUT (update), include the record ID.
            : '/api/food_ingredient_inventory_trace'; // For POST (create), no ID in URL.

        // Determine the HTTP method (POST for new, PUT for update).
        const method = isEdit ? 'PUT' : 'POST';

        // Call the submitRequest function with the URL, method, body, and toast reference.
        const result = await submitRequest(url, {
            method: method,
            body: currentRecord, // The data from the form.
        }, toast);

        // If the request was successful (result is not null), close the form and refetch data.
        if (result) {
            setShowForm(false); // Hide the dialog.
            setUpdate(prev => !prev); // Trigger a refetch of the inventory data.
        }
    };

    // This function is a template for the action column in the DataTable.
    // It renders the Edit and Delete buttons for each row.
    const actionBodyTemplate = (rowData: FoodIngredientInventory) => {
        return (
            <React.Fragment>
                {/* Edit button */}
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => handleEdit(rowData)} />
                {/* Delete button */}
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => handleDelete(rowData)} />
            </React.Fragment>
        );
    };

    return (
        <div className="card">
            {/* Toast component for displaying notifications (success, error, etc.) */}
            <Toast ref={toast} />

            {/* Page heading for the inventory section */}
            <PageHeading title="Food Ingredient Inventory" />

            {/* Container for the "Add New" button, aligned to the right */}
            <div className="flex justify-content-end mb-4">
                <Button label="Add New" icon="pi pi-plus" onClick={handleAdd} />
            </div>

            {/* Main DataTable component to display inventory items */}
            <DataTable value={inventory} loading={fetchLoading || submitLoading}>
                {/* Column for the ID field */}
                <Column field="id" header="ID" />
                {/* Column for the Food Ingredient ID */}
                <Column field="food_ingredient_id" header="Ingredient ID" />
                {/* Column for the Quantity */}
                <Column field="quantity" header="Quantity" />
                {/* Column for the Total Amount */}
                <Column field="total_amount" header="Total Amount" />
                {/* Column for the Supplier ID */}
                <Column field="supplier_id" header="Supplier ID" />
                {/* Column for actions (Edit and Delete buttons) */}
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }} />
            </DataTable>

            {/* The Dialog component for Add/Edit form */}
            <Dialog
                header={isEdit ? 'Edit Record' : 'Add Record'} // Dialog header changes based on add/edit mode
                visible={showForm} // Controls dialog visibility based on showForm state
                style={{ width: '50vw' }} // Sets the width of the dialog
                onHide={() => setShowForm(false)} // Closes the dialog when clicked outside or escape key pressed
            >
                {/* Form content for adding/editing a record */}
                <div className="p-fluid">
                    {/* Input field for Food Ingredient ID */}
                    <div className="field">
                        <label htmlFor="food_ingredient_id">Ingredient ID</label>
                        <InputText
                            id="food_ingredient_id"
                            value={currentRecord?.food_ingredient_id?.toString() || ''} // Convert to string for InputText
                            onChange={(e) => setCurrentRecord(prev => {
                                const current = prev || {
                                    food_ingredient_id: 0,
                                    quantity: 0,
                                    total_amount: 0,
                                    supplier_id: 0,
                                };
                                return {
                                    ...current,
                                    food_ingredient_id: parseInt(e.target.value) || 0
                                };
                            })} // Update state on change
                        />
                    </div>
                    {/* Input field for Quantity */}
                    <div className="field">
                        <label htmlFor="quantity">Quantity</label>
                        <InputText
                            id="quantity"
                            value={currentRecord?.quantity?.toString() || ''} // Convert to string
                            onChange={(e) => setCurrentRecord(prev => {
                                const current = prev || {
                                    food_ingredient_id: 0,
                                    quantity: 0,
                                    total_amount: 0,
                                    supplier_id: 0,
                                };
                                return {
                                    ...current,
                                    quantity: parseFloat(e.target.value) || 0
                                };
                            })} // Update state on change
                        />
                    </div>
                    {/* Input field for Total Amount */}
                    <div className="field">
                        <label htmlFor="total_amount">Total Amount</label>
                        <InputText
                            id="total_amount"
                            value={currentRecord?.total_amount?.toString() || ''} // Convert to string
                            onChange={(e) => setCurrentRecord(prev => {
                                const current = prev || {
                                    food_ingredient_id: 0,
                                    quantity: 0,
                                    total_amount: 0,
                                    supplier_id: 0,
                                };
                                return {
                                    ...current,
                                    total_amount: parseFloat(e.target.value) || 0
                                };
                            })} // Update state on change
                        />
                    </div>
                    {/* Input field for Supplier ID */}
                    <div className="field">
                        <label htmlFor="supplier_id">Supplier ID</label>
                        <InputText
                            id="supplier_id"
                            value={currentRecord?.supplier_id?.toString() || ''} // Convert to string
                            onChange={(e) => setCurrentRecord(prev => {
                                const current = prev || {
                                    food_ingredient_id: 0,
                                    quantity: 0,
                                    total_amount: 0,
                                    supplier_id: 0,
                                };
                                return {
                                    ...current,
                                    supplier_id: parseInt(e.target.value) || 0
                                };
                            })} // Update state on change
                        />
                    </div>
                </div>
                {/* Action buttons for the form */}
                <div className="flex justify-content-end gap-2 mt-4">
                    <Button label="Cancel" icon="pi pi-times" onClick={() => setShowForm(false)} className="p-button-text" />
                    <Button label="Save" icon="pi pi-check" onClick={handleSave} loading={submitLoading} />
                </div>
            </Dialog>
        </div>
    );
};

export default HomePage;
